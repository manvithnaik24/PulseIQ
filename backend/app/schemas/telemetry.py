from datetime import datetime
from pydantic import BaseModel

class HealthMetricBase(BaseModel):
    heart_rate: int
    spo2: int
    sleep_hours: float
    medication_compliance: int = 100
    health_score: int = 100

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetricResponse(HealthMetricBase):
    id: str
    user_id: str
    recorded_at: datetime

    class Config:
        from_attributes = True

class DeviceBase(BaseModel):
    device_name: str
    device_type: str
    serial_number: str

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: str
    user_id: str
    connected_at: datetime

    class Config:
        from_attributes = True

class WatchSyncRequest(HealthMetricBase):
    serial_number: str
class TelemetryRef:
    pass
