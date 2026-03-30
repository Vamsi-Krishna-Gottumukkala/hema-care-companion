from fastapi import APIRouter, HTTPException, Depends, Query
from app.auth.dependencies import get_current_user
from app.database import get_supabase_admin
from app.hospitals.mapbox_service import search_nearby_hospitals
import math

router = APIRouter(prefix="/api", tags=["Hospitals & Doctors"])

def get_distance_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in meters between two points on the earth."""
    R = 6371000  # Radius of earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.asin(math.sqrt(a))


@router.get("/hospitals/nearby")
async def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    user: dict = Depends(get_current_user),
):
    """Find nearby hospitals via Mapbox API and Local Database."""
    # 1. Fetch Mapbox API external hospitals
    mapbox_hospitals = await search_nearby_hospitals(lat, lng, radius)

    # 2. Fetch all local custom hospitals
    sb = get_supabase_admin()
    db_res = sb.table("hospitals").select("*").execute()
    local_hospitals = []
    
    if db_res.data:
        for dh in db_res.data:
            h_lat = dh.get("lat")
            h_lng = dh.get("lng")
            if h_lat is not None and h_lng is not None:
                dist = get_distance_haversine(lat, lng, float(h_lat), float(h_lng))
                if dist <= radius:
                    dh["source"] = "manual"
                    dh["distance"] = f"{int(dist + 0.5)} m" if dist < 1000 else f"{dist/1000:.1f} km"
                    local_hospitals.append(dh)

    # 3. Merge: Local verified DB hospitals get priority top sorting
    merged = local_hospitals + mapbox_hospitals

    return {"hospitals": merged, "total": len(merged)}


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
