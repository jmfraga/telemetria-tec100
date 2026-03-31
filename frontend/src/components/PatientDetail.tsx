import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Patient, VitalReading } from "../types";

interface Props {
  patient: Patient;
  history: VitalReading[];
  onClose: () => void;
}

interface ChartConfig {
  title: string;
  dataKey: keyof VitalReading;
  color: string;
  domain: [number, number];
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
  unit: string;
}

const CHARTS: ChartConfig[] = [
  {
    title: "SpO2",
    dataKey: "spo2",
    color: "#3b82f6",
    domain: [80, 100],
    warningLow: 93,
    criticalLow: 89,
    unit: "%",
  },
  {
    title: "Frecuencia Cardíaca",
    dataKey: "heart_rate",
    color: "#f43f5e",
    domain: [40, 140],
    warningLow: 55,
    warningHigh: 100,
    criticalLow: 45,
    criticalHigh: 120,
    unit: " lpm",
  },
  {
    title: "PA Sistólica",
    dataKey: "systolic",
    color: "#f97316",
    domain: [70, 180],
    warningLow: 90,
    warningHigh: 140,
    criticalLow: 80,
    criticalHigh: 160,
    unit: " mmHg",
  },
  {
    title: "PA Diastólica",
    dataKey: "diastolic",
    color: "#a855f7",
    domain: [40, 120],
    warningLow: 60,
    warningHigh: 90,
    criticalLow: 50,
    criticalHigh: 100,
    unit: " mmHg",
  },
];

export default function PatientDetail({ patient, history, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-5xl overflow-auto rounded-xl bg-slate-900 p-6 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cama {patient.bed}
            </p>
            <h2 className="text-xl font-bold text-white">{patient.name}</h2>
            <p className="text-sm text-slate-400">
              {patient.age} anos &middot; {patient.diagnosis}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Current vitals summary */}
        <div className="mb-6 grid grid-cols-5 gap-3">
          <VitalBadge
            label="SpO2"
            value={`${patient.vitals.spo2}%`}
            color="text-blue-400"
          />
          <VitalBadge
            label="FC"
            value={`${patient.vitals.heart_rate} lpm`}
            color="text-rose-400"
          />
          <VitalBadge
            label="PAS"
            value={`${patient.vitals.systolic} mmHg`}
            color="text-orange-400"
          />
          <VitalBadge
            label="PAD"
            value={`${patient.vitals.diastolic} mmHg`}
            color="text-purple-400"
          />
          <VitalBadge
            label="PI"
            value={`${patient.vitals.perfusion_index}%`}
            color="text-emerald-400"
          />
        </div>

        {/* Charts */}
        {history.length < 2 ? (
          <p className="py-12 text-center text-slate-500">
            Acumulando datos para graficar...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CHARTS.map((cfg) => (
              <VitalChart key={cfg.dataKey} config={cfg} data={history} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VitalBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-slate-800/50 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function VitalChart({
  config,
  data,
}: {
  config: ChartConfig;
  data: VitalReading[];
}) {
  return (
    <div className="rounded-lg bg-slate-800/30 p-4">
      <p className="mb-2 text-xs font-medium text-slate-400">{config.title}</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#64748b", fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={config.domain}
            tick={{ fill: "#64748b", fontSize: 10 }}
            width={35}
          />
          {config.warningLow != null && (
            <ReferenceLine
              y={config.warningLow}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          {config.warningHigh != null && (
            <ReferenceLine
              y={config.warningHigh}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          {config.criticalLow != null && (
            <ReferenceLine
              y={config.criticalLow}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          {config.criticalHigh != null && (
            <ReferenceLine
              y={config.criticalHigh}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
