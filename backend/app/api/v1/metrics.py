from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.telemetry import HealthMetric
from app.schemas.telemetry import HealthMetricResponse, HealthMetricCreate

router = APIRouter(prefix="/health-metrics", tags=["metrics"])

@router.post("/", response_model=HealthMetricResponse)
def log_health_metrics(
    metric_in: HealthMetricCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stores a new set of biometric telemetry readings in PostgreSQL."""
    new_metric = HealthMetric(
        user_id=current_user.id,
        heart_rate=metric_in.heart_rate,
        spo2=metric_in.spo2,
        sleep_hours=metric_in.sleep_hours,
        medication_compliance=metric_in.medication_compliance,
        health_score=metric_in.health_score
    )
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/history", response_model=List[HealthMetricResponse])
def get_metrics_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Retrieves chronological vital signs metrics trend logs.
    Supplies actual historical data to replace frontend hardcoded charts.
    """
    history = db.query(HealthMetric).filter(
        HealthMetric.user_id == current_user.id
    ).order_by(HealthMetric.recorded_at.desc()).limit(limit).all()
    
    # Return chronologically ascending (oldest to newest for plotting)
    return list(reversed(history))
