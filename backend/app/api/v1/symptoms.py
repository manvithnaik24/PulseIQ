from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.triage import SymptomTriageLog
from app.schemas.triage import SymptomTriageRequest, SymptomTriageResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/symptoms", tags=["symptoms"])

@router.post("/analyze", response_model=SymptomTriageResponse)
def analyze_patient_symptoms(
    req: SymptomTriageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes symptoms description via Gemini AI symptom checker triage."""
    # 1. Trigger AI symptom checker engine
    conditions, recommendations, severity = AIService.analyze_symptoms(req.symptoms)
    
    # 2. Log triage activity in database
    triage_log = SymptomTriageLog(
        user_id=current_user.id,
        symptoms=req.symptoms,
        onset_date=req.onset_date,
        severity=severity,
        possible_conditions=conditions,
        recommendations=recommendations
    )
    db.add(triage_log)
    db.commit()
    db.refresh(triage_log)
    
    return SymptomTriageResponse(
        id=triage_log.id,
        symptoms=triage_log.symptoms,
        possible_conditions=triage_log.possible_conditions,
        recommendations=triage_log.recommendations,
        severity=triage_log.severity
    )
