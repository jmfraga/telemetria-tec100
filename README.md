# Cancer Center Tec 100 — Sistema de Telemetria

Sistema de telemetria hospitalaria de bajo costo para el Cancer Center Tec 100 de Queretaro. Monitoreo en tiempo real de **12 pacientes** con signos vitales via dispositivos Bluetooth LE certificados.

## Signos vitales monitoreados

| Vital | Dispositivo | Protocolo |
|-------|------------|-----------|
| SpO2 + Frecuencia cardiaca | Wellue O2Ring / PC-60FW | Bluetooth LE |
| Presion arterial (sistolica/diastolica) | Omron HEM-7155T (X4 Smart) | Bluetooth LE |

## Arquitectura

```
DISPOSITIVOS (BLE)          SERVIDOR (Laptop)           VISUALIZACION
─────────────────           ──────────────────           ─────────────

Wellue O2Ring    ──BLE──┐
  (x12)                 │   ┌─────────────────┐
                        ├──▶│  Python Backend  │──WebSocket──▶ Dashboard Web
Omron HEM-7155T  ──BLE──┤   │  FastAPI + BLE   │              (React, browser)
  (x12)                 │   │  SQLite DB       │
                        └──▶│  Motor alertas   │──▶ Telegram Bot (alertas)
                            └─────────────────┘
```

## Stack tecnico

| Capa | Tecnologia |
|------|------------|
| BLE (Python) | `bleak` — libreria async BLE multiplataforma |
| Backend | Python 3.11 + FastAPI |
| Base de datos | SQLite (piloto) → PostgreSQL (produccion) |
| Tiempo real | WebSocket nativo FastAPI |
| Frontend | React 18 + TypeScript + Recharts + Tailwind CSS |
| Alertas | Telegram Bot API |
| Servidor | Laptop dedicada (bateria = UPS integrado) |

## Dashboard

- Grid de 12 camas con semaforo por paciente
- Legible a 2-3 metros (enfermeria de pie)
- Modo oscuro para guardia nocturna
- Alertas criticas via Telegram en < 10 segundos

### Estados del semaforo

| Estado | Significado |
|--------|-------------|
| Verde | Todos los vitales en rango normal |
| Amarillo | Al menos un vital en zona de precaucion |
| Rojo | Al menos un vital en zona critica + alerta Telegram |
| Gris | Sin senal / dispositivo desconectado |

## Estructura del proyecto

```
telemetria-tec100/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Settings (pydantic-settings)
│   │   ├── database.py          # SQLite async
│   │   ├── models.py            # ORM: Patient, VitalReading, Alert
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── routers/             # REST endpoints
│   │   ├── services/            # Alert engine, Telegram, BLE manager
│   │   ├── simulator/           # Simulador de 12 pacientes
│   │   └── websocket/           # WebSocket broadcast
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/          # Dashboard, PatientCard, charts
│       ├── hooks/               # useWebSocket
│       └── types/
├── docs/
│   ├── device-research.md       # Investigacion de dispositivos BLE
│   ├── architecture.md
│   └── deployment.md
└── scripts/                     # setup.sh, start.sh
```

## Fases de desarrollo

| Fase | Descripcion | Estado |
|------|------------|--------|
| 0 | Investigacion de dispositivos BLE | Completada |
| 1 | Simulador + dashboard + alertas (demo) | Pendiente |
| 2 | Integracion BLE con hardware real | Pendiente |
| 3 | Hardening para uso clinico | Pendiente |

## Costo estimado

| Concepto | Piloto (2 pacientes) | Produccion (12 pacientes) |
|----------|---------------------|--------------------------|
| Oximetros (Wellue O2Ring) | ~$5,000-7,000 MXN | ~$30,000-42,000 MXN |
| Baumanometros (Omron X4) | ~$2,000 MXN | ~$12,000 MXN |
| Software | $0 | $0 |
| Servidor (laptop existente) | $0 | $0 |
| **Total** | **~$7,000-9,000 MXN** | **~$42,000-54,000 MXN** |

## Ejecucion rapida (demo con simulador)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (desarrollo)
cd frontend
npm install
npm run dev
```

El dashboard estara disponible en `http://localhost:8000`.

## Notas regulatorias

- **COFEPRIS**: El sistema es una plataforma de visualizacion/soporte a decision, no un dispositivo diagnostico primario. Los dispositivos (Wellue y Omron) tienen su propia certificacion.
- **Privacidad**: Los datos se quedan en la red interna del hospital. Sin cloud requerido.
- **Dispositivos**: FDA cleared / CE certified. Validados clinicamente (ISO 80601-2-61 para oximetria, ISO 81060-2 para presion arterial).

## Licencia

MIT

---

*Cancer Center Tec 100, Queretaro — Proyecto de telemetria hospitalaria de bajo costo*
