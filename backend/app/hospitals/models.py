from pydantic import BaseModel, Field
from typing import Optional, List


class HospitalCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    specializations: Optional[List[str]] = []
    lat: Optional[float] = None
    lng: Optional[float] = None
    beds: Optional[int] = None
    founded: Optional[int] = None


class HospitalResponse(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = None
    specializations: Optional[List[str]] = []
    lat: Optional[float] = None
    lng: Optional[float] = None
    beds: Optional[int] = None
    founded: Optional[int] = None
    source: Optional[str] = "manual"
    distance: Optional[str] = None  # Calculated field


class DoctorCreate(BaseModel):
    name: str
    specialization: Optional[str] = None
    experience: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    rating: Optional[float] = None
    patients: Optional[int] = None
    education: Optional[str] = None
    avatar: Optional[str] = None
    available: bool = True
    contact: Optional[str] = None


class DoctorResponse(BaseModel):
    id: str
    name: str
    specialization: Optional[str] = None
    experience: Optional[str] = None
    hospital_id: Optional[str] = None
    hospital_name: Optional[str] = None
    rating: Optional[float] = None
    patients: Optional[int] = None
    education: Optional[str] = None
    avatar: Optional[str] = None
    available: bool = True
    contact: Optional[str] = None
