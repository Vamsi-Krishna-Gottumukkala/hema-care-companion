from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BloodValues(BaseModel):
    wbc: float = Field(..., ge=0, description="WBC Count (×10³/µL)")
    rbc: float = Field(..., ge=0, description="RBC Count (×10⁶/µL)")
    hemoglobin: float = Field(..., ge=0, description="Hemoglobin (g/dL)")
    platelet: float = Field(..., ge=0, description="Platelet Count (×10³/µL)")
    neutrophils: float = Field(..., ge=0, le=100, description="Neutrophils (%)")
    lymphocytes: float = Field(..., ge=0, le=100, description="Lymphocytes (%)")
    monocytes: float = Field(..., ge=0, le=100, description="Monocytes (%)")
    eosinophils: float = Field(..., ge=0, le=100, description="Eosinophils (%)")


class ParameterAnalysis(BaseModel):
    param: str
    value: float
    normal_min: float
    normal_max: float
    unit: str
    flagged: bool


class DiagnosisResult(BaseModel):
    status: str  # detected | not_detected
    cancer_type: str  # ALL | AML | CLL | CML | none
    risk_level: str  # high | medium | low
    confidence_score: float
    ai_explanation: List[str]
    parameter_analysis: List[ParameterAnalysis]


class DiagnosisResponse(BaseModel):
    id: str
    user_id: str
    input_type: str
    blood_values: Optional[BloodValues] = None
    report_file_url: Optional[str] = None
    result: DiagnosisResult
    created_at: str


class DiagnosisHistoryItem(BaseModel):
    id: str
    date: str
    input_type: str
    cancer_type: str
    risk_level: str
    confidence_score: float
    status: str
