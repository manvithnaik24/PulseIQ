from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.telemetry import Device, HealthMetric
from app.schemas.telemetry import DeviceCreate, DeviceResponse, WatchSyncRequest
from app.core.websockets import manager

router = APIRouter(prefix="/watches", tags=["watches"])

@router.post("/connect", response_model=DeviceResponse)
def connect_smartwatch(
    device_in: DeviceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pairs wearable smartwatch models to patient profiles."""
    existing = db.query(Device).filter(Device.serial_number == device_in.serial_number).first()
    if existing:
        if existing.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Device is already linked to another user profile."
            )
        return existing
        
    new_device = Device(
        user_id=current_user.id,
        device_name=device_in.device_name,
        device_type=device_in.device_type,
        serial_number=device_in.serial_number
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return new_device

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_smartwatch_vitals(
    req: WatchSyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Receives smartwatch health telemetry packets and streams updates to active WebSockets."""
    # Verify device exists and is connected to user
    device = db.query(Device).filter(
        Device.serial_number == req.serial_number,
        Device.user_id == current_user.id
    ).first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Smartwatch not registered or connected to this user profile."
        )
        
    # Log incoming telemetry
    new_metric = HealthMetric(
        user_id=current_user.id,
        heart_rate=req.heart_rate,
        spo2=req.spo2,
        sleep_hours=req.sleep_hours,
        medication_compliance=req.medication_compliance,
        health_score=req.health_score
    )
    db.add(new_metric)
    db.commit()
    
    # Broadcast live updates down active WebSocket pipelines
    await manager.send_personal_message(
        {
            "type": "live_update",
            "health_metrics": {
                "heart_rate": req.heart_rate,
                "spo2": req.spo2
            }
        },
        str(current_user.id)
    )
    
    return {"status": "success", "message": "Smartwatch telemetry synced successfully."}
