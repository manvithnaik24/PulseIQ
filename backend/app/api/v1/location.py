import requests
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.api.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/location", tags=["location"])

class LocationUpdateRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None
    timestamp: Optional[float] = None

class LocationUpdateResponse(BaseModel):
    city: str
    state: str
    country: str

def reverse_geocode(lat: float, lon: float) -> dict:
    """Queries OSM Nominatim API to resolve lat/lon coordinates to addresses."""
    try:
        # Nominatim requires User-Agent header
        headers = {"User-Agent": "PulseIQ/1.0 (pulseiq-backend)"}
        url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
        
        response = requests.get(url, headers=headers, timeout=4)
        if response.status_code == 200:
            address_data = response.json().get("address", {})
            city = address_data.get("city") or address_data.get("town") or address_data.get("village") or address_data.get("suburb") or "San Francisco"
            state = address_data.get("state") or "California"
            country = address_data.get("country") or "United States"
            return {"city": city, "state": state, "country": country}
    except Exception:
        pass
        
    # Baseline fallback coordinates default
    return {"city": "San Francisco", "state": "California", "country": "United States"}

@router.post("/update", response_model=LocationUpdateResponse)
def update_patient_location(
    req: LocationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Translates GPS tracking metrics to readable address regions and stores location in database."""
    current_user.last_latitude = req.latitude
    current_user.last_longitude = req.longitude
    current_user.gps_accuracy = req.accuracy
    
    if req.timestamp:
        try:
            current_user.gps_timestamp = datetime.fromtimestamp(req.timestamp / 1000.0)
        except Exception:
            current_user.gps_timestamp = func.now()
    else:
        current_user.gps_timestamp = func.now()
        
    db.commit()
    db.refresh(current_user)
    
    location = reverse_geocode(req.latitude, req.longitude)
    return location
