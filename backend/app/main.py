import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .simulator import HospitalSimulator
from .config import WS_INTERVAL

simulator = HospitalSimulator()
connected_clients: set[WebSocket] = set()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(title="Telemetría Cancer Center Tec 100", lifespan=lifespan)


async def broadcast_loop():
    while True:
        if connected_clients:
            update = simulator.tick()
            message = json.dumps(update)
            disconnected = set()
            for ws in connected_clients:
                try:
                    await ws.send_text(message)
                except Exception:
                    disconnected.add(ws)
            connected_clients -= disconnected
        await asyncio.sleep(WS_INTERVAL)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.add(ws)
    # Send initial state immediately
    update = simulator.tick()
    await ws.send_text(json.dumps(update))
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        connected_clients.discard(ws)


@app.get("/api/health")
async def health():
    return {"status": "ok", "beds": 12}


# --- Serve frontend build ---
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(frontend_dist / "assets")),
        name="static-assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(frontend_dist / "index.html"))
