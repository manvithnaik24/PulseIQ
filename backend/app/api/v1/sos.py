from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.sos import SosAlert, EmergencyContact
from app.models.family import FamilyMember
from app.schemas.sos import SosAlertResponse, SosAlertCreate
from app.core.websockets import manager

router = APIRouter(prefix="/sos", tags=["emergency"])

@router.get("/history", response_model=List[SosAlertResponse])
def get_sos_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves patient historical emergency logs."""
    history = db.query(SosAlert).filter(
        SosAlert.user_id == current_user.id
    ).order_by(SosAlert.triggered_at.desc()).all()
    
    # Fetch contacts to populate notified_contacts list for active/historical alert recovery
    family = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()
    
    notified_list = []
    for f in family:
        notified_list.append({
            "name": f.name,
            "relation": f.relation,
            "type": "Family Member",
            "contact": f.email or f.phone_number or "No email/phone"
        })
    for c in contacts:
        notified_list.append({
            "name": c.name,
            "relation": c.relationship,
            "type": "Emergency Contact",
            "contact": c.phone
        })
        
    for alert in history:
        alert.notified_contacts = notified_list
        
    return history

@router.post("/trigger", response_model=SosAlertResponse)
async def trigger_emergency_alert(
    alert_in: SosAlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logs active GPS emergency and triggers dashboard alarms via active WebSockets."""
    # Fetch family contacts to notify
    family = db.query(FamilyMember).filter(FamilyMember.user_id == current_user.id).all()
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()
    
    notified_list = []
    for f in family:
        notified_list.append({
            "name": f.name,
            "relation": f.relation,
            "type": "Family Member",
            "contact": f.email or f.phone_number or "No email/phone"
        })
    for c in contacts:
        notified_list.append({
            "name": c.name,
            "relation": c.relationship,
            "type": "Emergency Contact",
            "contact": c.phone
        })

    # Format notification template
    gmaps_link = f"https://www.google.com/maps/search/?api=1&query={alert_in.latitude},{alert_in.longitude}"
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    print("\n=== DISPATCHING EMERGENCY NOTIFICATION ALERT ===")
    for contact in notified_list:
        print(
            f"SENDING SMS/EMAIL TO: {contact['name']} ({contact['relation']}) via {contact['contact']}\n"
            f"Message Content:\n"
            f"-----------------------------------------\n"
            f"EMERGENCY ALERT\n\n"
            f"{current_user.full_name or current_user.email} has triggered SOS.\n\n"
            f"Location:\n{gmaps_link}\n\n"
            f"Time:\n{timestamp_str}\n"
            f"-----------------------------------------\n"
        )
    print("================================================\n")

    # Find any existing active alerts to prevent duplicate triggers
    active_alert = db.query(SosAlert).filter(
        SosAlert.user_id == current_user.id,
        SosAlert.status == "Active"
    ).first()
    
    if active_alert:
        active_alert.notified_contacts = notified_list
        return active_alert
        
    new_alert = SosAlert(
        user_id=current_user.id,
        status="Active",
        latitude=alert_in.latitude,
        longitude=alert_in.longitude,
        resolved_address=alert_in.resolved_address or "Unknown Location"
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    # Broadcast emergency flag immediately to all active sockets of the user
    await manager.send_personal_message(
        {
            "type": "live_update",
            "dashboard": {
                "status": "emergency",
                "alert_id": new_alert.id,
                "address": new_alert.resolved_address
            }
        },
        str(current_user.id)
    )
    
    new_alert.notified_contacts = notified_list
    return new_alert

@router.post("/resolve", response_model=List[SosAlertResponse])
async def resolve_ongoing_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resolves ongoing emergency alarms and updates states in PostgreSQL."""
    active_alerts = db.query(SosAlert).filter(
        SosAlert.user_id == current_user.id,
        SosAlert.status == "Active"
    ).all()
    
    resolved_time = datetime.now()
    for alert in active_alerts:
        alert.status = "Resolved"
        alert.resolved_at = resolved_time
        db.add(alert)
        
    db.commit()
    
    # Broadcast resolution to reset frontend screen
    await manager.send_personal_message(
        {
            "type": "live_update",
            "dashboard": {
                "status": "normal"
            }
        },
        str(current_user.id)
    )
    
    # Return updated list
    for alert in active_alerts:
        db.refresh(alert)
    return active_alerts
