import type { Patient, AlertLevel } from "../types";

interface Props {
  patient: Patient;
  onClick: () => void;
}

const BORDER_COLORS: Record<AlertLevel, string> = {
  normal: "border-l-emerald-500",
  warning: "border-l-amber-500",
  critical: "border-l-red-500",
  disconnected: "border-l-slate-600",
};

const BG_TINTS: Record<AlertLevel, string> = {
  normal: "bg-slate-900",
  warning: "bg-amber-950/30",
  critical: "bg-red-950/30",
  disconnected: "bg-slate-900/50",
};

const SPO2_COLORS: Record<AlertLevel, string> = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-red-400",
  disconnected: "text-slate-600",
};

export default function PatientCard({ patient, onClick }: Props) {
  const { bed, name, age, diagnosis, vitals, alert_level } = patient;
  const isCritical = alert_level === "critical";

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full cursor-pointer rounded-lg border-l-4
        ${BORDER_COLORS[alert_level]} ${BG_TINTS[alert_level]}
        p-4 text-left transition-all hover:brightness-110
        ${isCritical ? "animate-pulse-critical" : ""}
      `}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sillón {bed}
          </span>
          <p className="text-sm font-medium text-slate-200 leading-tight">
            {name}
          </p>
        </div>
        <span className="text-xs text-slate-500">{age} a</span>
      </div>

      <p className="mb-4 truncate text-xs text-slate-500">{diagnosis}</p>

      {/* Vitals */}
      <div className="grid grid-cols-3 gap-2">
        {/* SpO2 */}
        <div className="text-center">
          <p className={`text-3xl font-bold tabular-nums leading-none ${SPO2_COLORS[alert_level]}`}>
            {vitals.spo2}
            <span className="text-lg">%</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            SpO2
          </p>
        </div>

        {/* FC */}
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums leading-none text-slate-200">
            {vitals.heart_rate}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            FC
          </p>
        </div>

        {/* PA */}
        <div className="text-center">
          <p className="text-2xl font-bold tabular-nums leading-none text-slate-200">
            <span>{vitals.systolic}</span>
            <span className="text-base text-slate-500">/</span>
            <span className="text-xl">{vitals.diastolic}</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
            PA
          </p>
        </div>
      </div>

      {/* PI footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2">
        <span className="text-[10px] text-slate-600">
          PI {vitals.perfusion_index}%
        </span>
        <span className="text-[10px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
          Click para detalle
        </span>
      </div>
    </button>
  );
}
