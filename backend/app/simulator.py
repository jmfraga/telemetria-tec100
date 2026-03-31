import random
import uuid
from datetime import datetime, timezone

from .schemas import Patient, VitalSigns, Alert, AlertLevel
from .config import DEFAULT_THRESHOLDS, AlertThresholds

PATIENT_PROFILES = [
    {
        "bed": 1, "name": "María García López", "age": 58,
        "diagnosis": "Ca mama etapa IIIA",
        "base_spo2": 97, "base_hr": 76, "base_sys": 122, "base_dia": 78, "base_pi": 5.0,
        "variability": 1.0, "event_prob": 0.02, "event_type": None,
    },
    {
        "bed": 2, "name": "Roberto Hernández Díaz", "age": 72,
        "diagnosis": "Ca pulmón NSCLC etapa IV",
        "base_spo2": 93, "base_hr": 82, "base_sys": 135, "base_dia": 85, "base_pi": 2.5,
        "variability": 1.5, "event_prob": 0.08, "event_type": "desaturation",
    },
    {
        "bed": 3, "name": "Ana Sofía Martínez", "age": 45,
        "diagnosis": "LLA recaída",
        "base_spo2": 97, "base_hr": 88, "base_sys": 118, "base_dia": 72, "base_pi": 4.5,
        "variability": 1.2, "event_prob": 0.05, "event_type": "tachycardia",
    },
    {
        "bed": 4, "name": "José Luis Rodríguez", "age": 68,
        "diagnosis": "Ca próstata metastásico",
        "base_spo2": 96, "base_hr": 70, "base_sys": 130, "base_dia": 82, "base_pi": 4.0,
        "variability": 0.8, "event_prob": 0.01, "event_type": None,
    },
    {
        "bed": 5, "name": "Carmen Vega Sánchez", "age": 55,
        "diagnosis": "Ca colon etapa III",
        "base_spo2": 98, "base_hr": 74, "base_sys": 120, "base_dia": 76, "base_pi": 6.0,
        "variability": 0.7, "event_prob": 0.01, "event_type": None,
    },
    {
        "bed": 6, "name": "Fernando Torres", "age": 61,
        "diagnosis": "Linfoma DLBCL",
        "base_spo2": 96, "base_hr": 80, "base_sys": 115, "base_dia": 70, "base_pi": 3.5,
        "variability": 1.3, "event_prob": 0.04, "event_type": "hypotension",
    },
    {
        "bed": 7, "name": "Guadalupe Flores", "age": 49,
        "diagnosis": "Ca ovario etapa IIIC",
        "base_spo2": 97, "base_hr": 72, "base_sys": 118, "base_dia": 74, "base_pi": 5.5,
        "variability": 0.8, "event_prob": 0.01, "event_type": None,
    },
    {
        "bed": 8, "name": "Miguel Á. Reyes Cruz", "age": 75,
        "diagnosis": "Ca gástrico etapa IV",
        "base_spo2": 92, "base_hr": 84, "base_sys": 128, "base_dia": 80, "base_pi": 2.0,
        "variability": 1.8, "event_prob": 0.10, "event_type": "desaturation",
    },
    {
        "bed": 9, "name": "Patricia Mendoza", "age": 63,
        "diagnosis": "Ca endometrio etapa II",
        "base_spo2": 98, "base_hr": 68, "base_sys": 125, "base_dia": 78, "base_pi": 5.0,
        "variability": 0.6, "event_prob": 0.01, "event_type": None,
    },
    {
        "bed": 10, "name": "Ricardo Jiménez", "age": 57,
        "diagnosis": "Mieloma múltiple",
        "base_spo2": 97, "base_hr": 76, "base_sys": 122, "base_dia": 76, "base_pi": 4.8,
        "variability": 0.9, "event_prob": 0.02, "event_type": None,
    },
    {
        "bed": 11, "name": "Elena Castro Morales", "age": 42,
        "diagnosis": "Ca mama triple negativo",
        "base_spo2": 98, "base_hr": 90, "base_sys": 116, "base_dia": 72, "base_pi": 4.5,
        "variability": 1.4, "event_prob": 0.06, "event_type": "tachycardia",
    },
    {
        "bed": 12, "name": "Arturo Navarro Peña", "age": 70,
        "diagnosis": "Ca vejiga etapa III",
        "base_spo2": 95, "base_hr": 78, "base_sys": 142, "base_dia": 88, "base_pi": 3.0,
        "variability": 1.2, "event_prob": 0.04, "event_type": "hypertension",
    },
]


class PatientSimulator:
    def __init__(self, profile: dict, thresholds: AlertThresholds = DEFAULT_THRESHOLDS):
        self.profile = profile
        self.thresholds = thresholds
        self.spo2 = float(profile["base_spo2"])
        self.hr = float(profile["base_hr"])
        self.sys = float(profile["base_sys"])
        self.dia = float(profile["base_dia"])
        self.pi = float(profile["base_pi"])
        self.in_event = False
        self.event_ticks_remaining = 0

    def tick(self) -> tuple[Patient, list[Alert]]:
        v = self.profile["variability"]
        base = self.profile

        # Start new event?
        if not self.in_event and random.random() < self.profile["event_prob"]:
            self.in_event = True
            self.event_ticks_remaining = random.randint(5, 15)

        # Apply event effects
        if self.in_event:
            self.event_ticks_remaining -= 1
            if self.event_ticks_remaining <= 0:
                self.in_event = False
            else:
                etype = self.profile["event_type"]
                if etype == "desaturation":
                    self.spo2 -= random.uniform(0.5, 2.0)
                elif etype == "tachycardia":
                    self.hr += random.uniform(1.0, 4.0)
                elif etype == "hypotension":
                    self.sys -= random.uniform(1.0, 3.0)
                    self.dia -= random.uniform(0.5, 1.5)
                elif etype == "hypertension":
                    self.sys += random.uniform(1.0, 3.0)
                    self.dia += random.uniform(0.5, 1.5)

        # Random walk with mean reversion
        self.spo2 += random.gauss(0, v * 0.3) + (base["base_spo2"] - self.spo2) * 0.05
        self.hr += random.gauss(0, v * 1.0) + (base["base_hr"] - self.hr) * 0.05
        self.sys += random.gauss(0, v * 1.5) + (base["base_sys"] - self.sys) * 0.03
        self.dia += random.gauss(0, v * 1.0) + (base["base_dia"] - self.dia) * 0.03
        self.pi += random.gauss(0, v * 0.2) + (base["base_pi"] - self.pi) * 0.1

        # Clamp
        self.spo2 = max(70, min(100, self.spo2))
        self.hr = max(35, min(180, self.hr))
        self.sys = max(60, min(200, self.sys))
        self.dia = max(30, min(130, self.dia))
        self.pi = max(0.1, min(20.0, self.pi))

        spo2 = round(self.spo2)
        hr = round(self.hr)
        sys_val = round(self.sys)
        dia_val = round(self.dia)
        pi_val = round(self.pi, 1)

        alert_level, alerts = self._check_vitals(spo2, hr, sys_val, dia_val)

        patient = Patient(
            bed=self.profile["bed"],
            name=self.profile["name"],
            age=self.profile["age"],
            diagnosis=self.profile["diagnosis"],
            vitals=VitalSigns(
                spo2=spo2,
                heart_rate=hr,
                systolic=sys_val,
                diastolic=dia_val,
                perfusion_index=pi_val,
            ),
            alert_level=alert_level,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        return patient, alerts

    def _check_vitals(
        self, spo2: int, hr: int, sys_val: int, dia_val: int
    ) -> tuple[AlertLevel, list[Alert]]:
        alerts: list[Alert] = []
        max_level: AlertLevel = "normal"
        now = datetime.now(timezone.utc).isoformat()
        t = self.thresholds

        def add(vital: str, value: float, level: AlertLevel, msg: str):
            nonlocal max_level
            if level == "critical":
                max_level = "critical"
            elif level == "warning" and max_level != "critical":
                max_level = "warning"
            alerts.append(Alert(
                id=uuid.uuid4().hex[:8],
                bed=self.profile["bed"],
                patient_name=self.profile["name"],
                message=msg,
                level=level,
                timestamp=now,
                vital=vital,
                value=value,
            ))

        # SpO2
        if spo2 <= t.spo2_critical:
            add("spo2", spo2, "critical", f"SpO2 crítico: {spo2}%")
        elif spo2 <= t.spo2_warning:
            add("spo2", spo2, "warning", f"SpO2 bajo: {spo2}%")

        # FC
        if hr >= t.hr_high_critical:
            add("heart_rate", hr, "critical", f"FC muy alta: {hr} lpm")
        elif hr <= t.hr_low_critical:
            add("heart_rate", hr, "critical", f"FC muy baja: {hr} lpm")
        elif hr >= t.hr_high_warning:
            add("heart_rate", hr, "warning", f"FC alta: {hr} lpm")
        elif hr <= t.hr_low_warning:
            add("heart_rate", hr, "warning", f"FC baja: {hr} lpm")

        # PAS
        if sys_val >= t.sys_high_critical:
            add("systolic", sys_val, "critical", f"PAS muy alta: {sys_val} mmHg")
        elif sys_val <= t.sys_low_critical:
            add("systolic", sys_val, "critical", f"PAS muy baja: {sys_val} mmHg")
        elif sys_val >= t.sys_high_warning:
            add("systolic", sys_val, "warning", f"PAS alta: {sys_val} mmHg")
        elif sys_val <= t.sys_low_warning:
            add("systolic", sys_val, "warning", f"PAS baja: {sys_val} mmHg")

        # PAD
        if dia_val >= t.dia_high_critical:
            add("diastolic", dia_val, "critical", f"PAD muy alta: {dia_val} mmHg")
        elif dia_val <= t.dia_low_critical:
            add("diastolic", dia_val, "critical", f"PAD muy baja: {dia_val} mmHg")
        elif dia_val >= t.dia_high_warning:
            add("diastolic", dia_val, "warning", f"PAD alta: {dia_val} mmHg")
        elif dia_val <= t.dia_low_warning:
            add("diastolic", dia_val, "warning", f"PAD baja: {dia_val} mmHg")

        return max_level, alerts


class HospitalSimulator:
    def __init__(self):
        self.patient_sims = [PatientSimulator(p) for p in PATIENT_PROFILES]
        self.recent_alerts: list[Alert] = []
        self.max_alerts = 50

    def tick(self) -> dict:
        patients = []
        new_alerts = []
        for sim in self.patient_sims:
            patient, alerts = sim.tick()
            patients.append(patient)
            new_alerts.extend(alerts)

        self.recent_alerts = new_alerts + self.recent_alerts
        self.recent_alerts = self.recent_alerts[: self.max_alerts]

        return {
            "type": "update",
            "patients": [p.model_dump() for p in patients],
            "alerts": [a.model_dump() for a in self.recent_alerts],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
