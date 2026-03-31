import { useEffect, useRef, useState, useCallback } from "react";
import type { Patient, Alert, DashboardUpdate, VitalReading } from "../types";

const MAX_HISTORY = 120; // ~6 min at 3s interval

export function useWebSocket() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connected, setConnected] = useState(false);
  const historyRef = useRef<Record<number, VitalReading[]>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();

  const getHistory = useCallback((bed: number): VitalReading[] => {
    return historyRef.current[bed] ?? [];
  }, []);

  useEffect(() => {
    function connect() {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        const data: DashboardUpdate = JSON.parse(event.data);
        setPatients(data.patients);
        setAlerts(data.alerts);

        // Accumulate history
        for (const p of data.patients) {
          const ts = new Date(p.timestamp);
          const timeStr = ts.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          const reading: VitalReading = {
            time: timeStr,
            spo2: p.vitals.spo2,
            heart_rate: p.vitals.heart_rate,
            systolic: p.vitals.systolic,
            diastolic: p.vitals.diastolic,
            perfusion_index: p.vitals.perfusion_index,
          };
          if (!historyRef.current[p.bed]) {
            historyRef.current[p.bed] = [];
          }
          const arr = historyRef.current[p.bed]!;
          arr.push(reading);
          if (arr.length > MAX_HISTORY) {
            arr.shift();
          }
        }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, []);

  return { patients, alerts, connected, getHistory };
}
