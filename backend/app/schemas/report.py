from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ReportBase(BaseModel):
    report_name: str
    practitioner_name: Optional[str] = None
    facility_name: Optional[str] = None
    report_type: Optional[str] = None
    file_size: Optional[str] = None

class ReportCreate(ReportBase):
    extracted_text: Optional[str] = None
    summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    abnormal_values: Optional[List[str]] = None
    risk_level: str = "Low"
    recommendations: Optional[List[str]] = None
    file_path: Optional[str] = None

class ReportResponse(ReportBase):
    id: str
    user_id: str
    summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    abnormal_values: Optional[List[str]] = None
    risk_level: str
    recommendations: Optional[List[str]] = None
    file_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReportUploadResponse(BaseModel):
    id: str
    extracted_text: str
    created_at: datetime

class ReportAnalyzeRequest(BaseModel):
    report_id: str
    extracted_text: str

class ReportAnalyzeResponse(BaseModel):
    practitioner_name: Optional[str] = None
    facility_name: Optional[str] = None
    summary: str
    key_findings: List[str] = []
    abnormal_values: List[str] = []
    risk_level: str = "Low"
    recommendations: List[str] = []

class ReportGenerateRequest(BaseModel):
    practitioner_name: str
    facility_name: str
    report_title: str
class ReportRef:
    pass
