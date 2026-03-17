from fastapi import APIRouter, HTTPException, Depends, Query
from app.auth.dependencies import get_current_user
from app.database import get_supabase_admin
from app.hospitals.google_maps_service import search_nearby_hospitals

router = APIRouter(prefix="/api", tags=["Hospitals & Doctors"])


@router.get("/hospitals/nearby")
async def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    user: dict = Depends(get_current_user),
):
    """Find nearby hospitals via Google Maps API."""
    hospitals = await search_nearby_hospitals(lat, lng, radius)
    return {"hospitals": hospitals, "total": len(hospitals)}


@router.get("/hospitals")
async def list_hospitals(user: dict = Depends(get_current_user)):
    """List all hospitals from database."""
    sb = get_supabase_admin()
    result = sb.table("hospitals").select("*").order("name").execute()
    return {"hospitals": result.data, "total": len(result.data)}


@router.get("/hospitals/{hospital_id}")
async def get_hospital(hospital_id: str, user: dict = Depends(get_current_user)):
    """Get hospital details."""
    sb = get_supabase_admin()
    result = sb.table("hospitals").select("*").eq("id", hospital_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return result.data[0]


@router.get("/hospitals/{hospital_id}/doctors")
async def get_hospital_doctors(hospital_id: str, user: dict = Depends(get_current_user)):
    """Get doctors at a specific hospital."""
    sb = get_supabase_admin()
    result = sb.table("doctors").select("*").eq("hospital_id", hospital_id).execute()
    return {"doctors": result.data, "total": len(result.data)}


@router.get("/doctors")
async def list_doctors(
    user: dict = Depends(get_current_user),
    specialization: str | None = None,
    available: bool | None = None,
):
    """List all doctors with optional filters."""
    sb = get_supabase_admin()
    query = sb.table("doctors").select("*")

    if specialization:
        query = query.ilike("specialization", f"%{specialization}%")
    if available is not None:
        query = query.eq("available", available)

    result = query.order("name").execute()
    return {"doctors": result.data, "total": len(result.data)}
