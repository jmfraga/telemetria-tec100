export type AlertLevel = "normal" | "warning" | "critical" | "disconnected";

export interface VitalSigns {
  spo2: number;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  perfusion_index: number;
}

export interface Patient {
  bed: number;
  name: string;
  age: number;
  diagnosis: string;
  vitals: VitalSigns;
  alert_level: AlertLevel;
  timestamp: string;
}

export interface Alert {
  id: string;
  bed: number;
  patient_name: string;
  message: string;
  level: AlertLevel;
  timestamp: string;
  vital: string;
  value: number;
}

export interface DashboardUpdate {
  type: string;
  patients: Patient[];
  alerts: Alert[];
  timestamp: string;
}

export interface VitalReading {
  time: string;
  spo2: number;
  heart_rate: number;
  systolic: number;
  diastolic: number;
  perfusion_index: number;
}
