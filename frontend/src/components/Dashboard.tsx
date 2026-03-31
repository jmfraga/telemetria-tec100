import { useEffect, useState } from "react";
import type { Patient, Alert } from "../types";
import PatientCard from "./PatientCard";
import AlertPanel from "./AlertPanel";

interface Props {
  patients: Patient[];
  alerts: Alert[];
  connected: boolean;
  onSelectPatient: (p: Patient) => void;
}

export default function Dashboard({
  patients,
  alerts,
  connected,
  onSelectPatient,
}: Props) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const normal = patients.filter((p) => p.alert_level === "normal").length;
  const warning = patients.filter((p) => p.alert_level === "warning").length;
  const critical = patients.filter((p) => p.alert_level === "critical").length;

  return (
    <div className="flex h-screen">
      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight text-white">
              Cancer Center Tec 100
              <span className="ml-2 font-normal text-slate-400">
                Telemetría
              </span>
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                connected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-red-400 animate-pulse"
                }`}
              />
              {connected ? "Conectado" : "Desconectado"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Summary badges */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">{normal}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">{warning}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-slate-300">{critical}</span>
              </span>
            </div>

            <time className="font-mono text-sm text-slate-400">
              {clock.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </time>
          </div>
        </header>

        {/* Patient grid */}
        <main className="flex-1 overflow-auto p-4">
          {patients.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              Esperando datos del servidor...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {patients.map((p) => (
                <PatientCard
                  key={p.bed}
                  patient={p}
                  onClick={() => onSelectPatient(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Alert sidebar */}
      <AlertPanel alerts={alerts} />
    </div>
  );
}
