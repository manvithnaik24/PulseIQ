import os
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.report import Report
from app.models.telemetry import HealthMetric
from app.models.medication import Medication
from app.schemas.report import ReportResponse, ReportUploadResponse, ReportAnalyzeRequest, ReportAnalyzeResponse, ReportGenerateRequest
from app.services.pdf_service import PDFService
from app.services.ai_service import AIService

router = APIRouter(prefix="/reports", tags=["reports"])

# Setup local static directory for file storage
STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "static")
REPORTS_DIR = os.path.join(STATIC_DIR, "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

@router.get("/", response_model=List[ReportResponse])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists clinical reports uploaded by the patient."""
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    return reports

@router.post("/upload", response_model=ReportResponse)
async def upload_report_file(
    file: UploadFile = File(...),
    report_type: str = Form("Other"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes report file upload (PDF/JPG/PNG), enforces validation, and saves metadata."""
    allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
    ext = os.path.splitext(file.filename.lower())[1]
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF, JPG, JPEG, and PNG files are supported."
        )
        
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 20MB limit."
        )
        
    # Calculate formatted file size
    size_bytes = len(file_bytes)
    if size_bytes >= 1024 * 1024:
        formatted_size = f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        formatted_size = f"{size_bytes / 1024:.1f} KB"

    # Extract text (PDF only, since AI/OCR is not yet implemented for images)
    if ext == '.pdf':
        extracted_text = PDFService.extract_text_from_pdf(file_bytes)
    else:
        extracted_text = f"Image report uploaded. Format: {ext.upper()[1:]}. Size: {formatted_size}."
        
    # Save file locally to static reports folder
    file_uuid = str(uuid.uuid4())
    filename = f"{file_uuid}_{file.filename}"
    file_path_full = os.path.join(REPORTS_DIR, filename)
    
    with open(file_path_full, "wb") as f:
        f.write(file_bytes)
        
    # Trigger AI analysis synchronously on upload
    try:
        ai_analysis = AIService.analyze_report(
            extracted_text, 
            file_bytes=file_bytes if ext in {'.jpg', '.jpeg', '.png'} else None, 
            mime_type=file.content_type if ext in {'.jpg', '.jpeg', '.png'} else None
        )
    except Exception as e:
        import logging
        logging.getLogger("pulseiq.api").error(f"Error during report analysis on upload: {e}")
        ai_analysis = {
            "practitioner_name": "Unknown Practitioner",
            "facility_name": "Unknown Facility",
            "summary": "Clinical details pending review.",
            "key_findings": [],
            "abnormal_values": [],
            "risk_level": "Low",
            "recommendations": []
        }

    relative_url = f"/static/reports/{filename}"
    
    # Create report record
    new_report = Report(
        user_id=current_user.id,
        report_name=file.filename,
        report_type=report_type,
        file_size=formatted_size,
        extracted_text=extracted_text,
        file_path=relative_url,
        practitioner_name=ai_analysis.get("practitioner_name") or "Unknown Practitioner",
        facility_name=ai_analysis.get("facility_name") or "Unknown Facility",
        summary=ai_analysis.get("summary") or "Clinical details pending review.",
        key_findings=ai_analysis.get("key_findings") or [],
        abnormal_values=ai_analysis.get("abnormal_values") or [],
        risk_level=ai_analysis.get("risk_level") or "Low",
        recommendations=ai_analysis.get("recommendations") or []
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return new_report

@router.post("/analyze", response_model=ReportResponse)
def analyze_report_text(
    req: ReportAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submits extracted report text to Gemini AI for clinical simplification."""
    report = db.query(Report).filter(
        Report.id == req.report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health report not found."
        )
        
    # Check if report has a file path that is an image, to pass image bytes for re-analysis
    file_bytes = None
    mime_type = None
    if report.file_path and report.file_path.startswith("/static/"):
        filename = report.file_path.split("/")[-1]
        file_path_full = os.path.join(REPORTS_DIR, filename)
        ext = os.path.splitext(filename.lower())[1]
        if ext in {'.jpg', '.jpeg', '.png'} and os.path.exists(file_path_full):
            try:
                with open(file_path_full, "rb") as f:
                    file_bytes = f.read()
                mime_type = "image/png" if ext == ".png" else "image/jpeg"
            except Exception:
                pass

    # Analyze text using Gemini with Groq fallback
    analysis = AIService.analyze_report(req.extracted_text, file_bytes=file_bytes, mime_type=mime_type)
    
    # Update report metadata
    report.practitioner_name = analysis.get("practitioner_name") or report.practitioner_name or "Unknown Practitioner"
    report.facility_name = analysis.get("facility_name") or report.facility_name or "Unknown Facility"
    report.summary = analysis.get("summary") or "Report processed successfully."
    report.key_findings = analysis.get("key_findings") or []
    report.abnormal_values = analysis.get("abnormal_values") or []
    report.risk_level = analysis.get("risk_level") or "Low"
    report.recommendations = analysis.get("recommendations") or []
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return report

@router.post("/generate")
def generate_health_assessment_pdf(
    req: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compiles active vitals, medicines, and AI reviews into printable A4 PDF."""
    # Retrieve latest health vitals
    latest_metric = db.query(HealthMetric).filter(
        HealthMetric.user_id == current_user.id
    ).order_by(HealthMetric.recorded_at.desc()).first()
    
    vitals_dict = {}
    if latest_metric:
        vitals_dict = {
            "heart_rate": latest_metric.heart_rate,
            "spo2": latest_metric.spo2,
            "sleep_hours": float(latest_metric.sleep_hours),
            "medication_compliance": latest_metric.medication_compliance,
            "health_score": latest_metric.health_score
        }
    else:
        vitals_dict = {"heart_rate": 72, "spo2": 98, "sleep_hours": 7.5, "medication_compliance": 100, "health_score": 90}

    # Retrieve medications schedule
    meds = db.query(Medication).filter(
        Medication.user_id == current_user.id,
        Medication.is_active == True
    ).all()
    
    # Compile dynamic AI warnings/recs
    recommendations = []
    if latest_metric and latest_metric.spo2 < 95:
        recommendations.append("URGENT: Oxygen saturation logged below ideal targets. Consult cardiologist.")
    if latest_metric and (latest_metric.heart_rate > 100 or latest_metric.heart_rate < 55):
        recommendations.append("Cardiac logs suggest transient heart rate outliers. Limit stress factors.")
    if not recommendations:
        recommendations = [
            "Maintain current medication adherence patterns.",
            "Schedule regular telemedicine reviews.",
            "Biometric logs indicate stable standard baseline thresholds."
        ]
        
    pdf_bytes = PDFService.generate_health_report_pdf(
        title=req.report_title,
        practitioner=req.practitioner_name,
        facility=req.facility_name,
        vitals=vitals_dict,
        medications=meds,
        recommendations=recommendations
    )
    
    # Save compiled PDF to database reports vault so it appears in history
    report_uuid = str(uuid.uuid4())
    filename = f"generated_{report_uuid}_report.pdf"
    file_path_full = os.path.join(REPORTS_DIR, filename)
    with open(file_path_full, "wb") as f:
        f.write(pdf_bytes)
        
    db_report = Report(
        user_id=current_user.id,
        report_name=f"{req.report_title}.pdf",
        practitioner_name=req.practitioner_name,
        facility_name=req.facility_name,
        summary=f"Automated health compilation summary generated on {datetime.now().strftime('%Y-%m-%d')}.",
        key_findings=["Vitals status normal", "Medication lists synced"],
        risk_level="Low",
        recommendations=recommendations,
        file_path=f"/static/reports/{filename}"
    )
    db.add(db_report)
    db.commit()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={req.report_title.replace(' ', '_')}.pdf"}
    )

@router.delete("/{id}")
def delete_report(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an uploaded report file and removes the DB record."""
    report = db.query(Report).filter(
        Report.id == id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )
        
    # Delete local file if it exists
    if report.file_path and report.file_path.startswith("/static/"):
        filename = report.file_path.split("/")[-1]
        file_path_full = os.path.join(REPORTS_DIR, filename)
        try:
            if os.path.exists(file_path_full):
                os.remove(file_path_full)
        except Exception:
            pass
            
    db.delete(report)
    db.commit()
    return {"status": "success", "message": "Report deleted successfully."}

@router.get("/{id}/pdf")
def download_report_ai_pdf(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates a professional healthcare-style PDF summary of the AI analysis results."""
    report = db.query(Report).filter(
        Report.id == id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found."
        )
        
    patient_name = current_user.full_name or "PulseIQ Patient"
    date_str = report.created_at.strftime('%Y-%m-%d %I:%M %p') if report.created_at else datetime.now().strftime('%Y-%m-%d %I:%M %p')
    
    pdf_bytes = PDFService.generate_ai_summary_pdf(
        patient_name=patient_name,
        report_name=report.report_name,
        report_type=report.report_type or "General",
        date_str=date_str,
        summary=report.summary or "Clinical details pending review.",
        findings=report.key_findings or [],
        abnormal_values=report.abnormal_values or [],
        recommendations=report.recommendations or [],
        risk_level=report.risk_level or "Low"
    )
    
    filename = f"AI_Summary_{report.report_name.replace(' ', '_')}"
    if not filename.endswith(".pdf"):
        filename += ".pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
