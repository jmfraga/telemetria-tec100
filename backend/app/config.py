from pydantic import BaseModel


class AlertThresholds(BaseModel):
    spo2_warning: int = 93
    spo2_critical: int = 89
    hr_high_warning: int = 100
    hr_high_critical: int = 120
    hr_low_warning: int = 55
    hr_low_critical: int = 45
    sys_high_warning: int = 140
    sys_high_critical: int = 160
    sys_low_warning: int = 90
    sys_low_critical: int = 80
    dia_high_warning: int = 90
    dia_high_critical: int = 100
    dia_low_warning: int = 60
    dia_low_critical: int = 50


WS_INTERVAL = 3.0
NUM_BEDS = 12
DEFAULT_THRESHOLDS = AlertThresholds()
