from __future__ import annotations

from pydantic import BaseModel
from typing import Literal

AlertLevel = Literal["normal", "warning", "critical", "disconnected"]


class VitalSigns(BaseModel):
    spo2: int
    heart_rate: int
    systolic: int
    diastolic: int
    perfusion_index: float


class Patient(BaseModel):
    bed: int
    name: str
    age: int
    diagnosis: str
    vitals: VitalSigns
    alert_level: AlertLevel
    timestamp: str


class Alert(BaseModel):
    id: str
    bed: int
    patient_name: str
    message: str
    level: AlertLevel
    timestamp: str
    vital: str
    value: float


class DashboardUpdate(BaseModel):
    type: str = "update"
    patients: list[Patient]
    alerts: list[Alert]
    timestamp: str
