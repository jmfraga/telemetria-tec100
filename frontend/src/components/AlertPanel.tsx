import type { Alert } from "../types";

interface Props {
  alerts: Alert[];
}

export default function AlertPanel({ alerts }: Props) {
  return (
    <aside className="flex w-72 flex-col border-l border-slate-800 bg-slate-900/50">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Alertas
          {alerts.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-400">
              {alerts.length}
            </span>
          )}
        </h2>
      </div>

      <div className="custom-scrollbar flex-1 overflow-auto">
        {alerts.length === 0 ? (
          <p className="p-4 text-center text-xs text-slate-600">
            Sin alertas activas
          </p>
        ) : (
          <ul className="divide-y divide-slate-800/50">
            {alerts.map((alert) => (
              <li key={alert.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      alert.level === "critical"
                        ? "bg-red-500 animate-pulse"
                        : "bg-amber-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200">
                      Cama {alert.bed}
                    </p>
                    <p
                      className={`text-xs ${
                        alert.level === "critical"
                          ? "text-red-400"
                          : "text-amber-400"
                      }`}
                    >
                      {alert.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-600">
                      {new Date(alert.timestamp).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
