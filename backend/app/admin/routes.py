from fastapi import APIRouter, HTTPException, Depends, Query
from app.auth.dependencies import require_admin
from app.database import get_supabase_admin
from app.hospitals.models import HospitalCreate, DoctorCreate

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(require_admin)):
    """Get dashboard statistics."""
    sb = get_supabase_admin()

    # Total users
    users_result = sb.table("users").select("id", count="exact").eq("role", "user").execute()
    total_users = users_result.count or 0

    # Total diagnoses
    diag_result = sb.table("diagnoses").select("id", count="exact").execute()
    total_diagnoses = diag_result.count or 0

    # Cancer detected count
    detected_result = sb.table("diagnoses").select("id", count="exact").eq("status", "detected").execute()
    cancer_detected = detected_result.count or 0

    # Average confidence
    all_diags = sb.table("diagnoses").select("confidence_score").execute()
    scores = [d["confidence_score"] for d in (all_diags.data or []) if d.get("confidence_score")]
    avg_accuracy = round(sum(scores) / len(scores), 1) if scores else 0

    # Monthly data (last 7 months)
    monthly_diags = sb.table("diagnoses") \
        .select("created_at, status") \
        .order("created_at", desc=True) \
        .limit(500) \
        .execute()

    from collections import defaultdict
    from datetime import datetime
    monthly = defaultdict(lambda: {"diagnoses": 0, "detected": 0})
    for d in (monthly_diags.data or []):
        if d.get("created_at"):
            month_key = d["created_at"][:7]  # YYYY-MM
            monthly[month_key]["diagnoses"] += 1
            if d.get("status") == "detected":
                monthly[month_key]["detected"] += 1

    monthly_data = [
        {"month": k, "diagnoses": v["diagnoses"], "detected": v["detected"]}
        for k, v in sorted(monthly.items())[-7:]
    ]

    # Cancer type distribution
    type_result = sb.table("diagnoses").select("cancer_type").execute()
    type_counts = defaultdict(int)
    for d in (type_result.data or []):
        ct = d.get("cancer_type", "none")
        type_counts[ct] += 1

    cancer_type_data = [
        {"name": k, "value": v}
        for k, v in type_counts.items()
    ]

    return {
        "total_users": total_users,
        "total_diagnoses": total_diagnoses,
        "cancer_detected": cancer_detected,
        "model_accuracy": avg_accuracy,
        "monthly_data": monthly_data,
        "cancer_type_data": cancer_type_data,
    }


@router.get("/users")
async def list_users(
    admin: dict = Depends(require_admin),
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
):
    """List all users (paginated, searchable)."""
    sb = get_supabase_admin()
    offset = (page - 1) * limit

    query = sb.table("users").select("id, name, email, role, status, created_at, avatar")

    if search:
        query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    count_query = sb.table("users").select("id", count="exact")
    if search:
        count_query = count_query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
    count_result = count_query.execute()

    # Get test count per user
    users_with_stats = []
    for user in result.data:
        diag_count = sb.table("diagnoses").select("id", count="exact").eq("user_id", user["id"]).execute()
        user["tests_count"] = diag_count.count or 0
        users_with_stats.append(user)

    return {
        "items": users_with_stats,
        "total": count_result.count or 0,
        "page": page,
        "limit": limit,
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str = Query(..., regex="^(active|disabled)$"),
    admin: dict = Depends(require_admin),
):
    """Enable or disable a user."""
    sb = get_supabase_admin()
    result = sb.table("users").update({"status": status}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Log the action
    action = "disabled" if status == "disabled" else "enabled"
    sb.table("system_logs").insert({
        "level": "INFO",
        "module": "User Management",
        "message": f"Admin {action} account {user_id}",
        "user_id": admin["id"],
    }).execute()

    return {"message": f"User {action} successfully", "user": result.data[0]}


@router.get("/diagnoses")
async def list_all_diagnoses(
    admin: dict = Depends(require_admin),
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = Query(None, alias="status"),
):
    """List all diagnoses across all users."""
    sb = get_supabase_admin()
    offset = (page - 1) * limit

    query = sb.table("diagnoses").select("*")
    if status_filter:
        query = query.eq("status", status_filter)

    result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()

    count_query = sb.table("diagnoses").select("id", count="exact")
    if status_filter:
        count_query = count_query.eq("status", status_filter)
    count_result = count_query.execute()

    # Enrich with user info
    items = []
    for diag in result.data:
        user_result = sb.table("users").select("name, email").eq("id", diag["user_id"]).execute()
        if user_result.data:
            diag["user_name"] = user_result.data[0]["name"]
            diag["user_email"] = user_result.data[0]["email"]
        items.append(diag)

    return {
        "items": items,
        "total": count_result.count or 0,
        "page": page,
        "limit": limit,
    }


@router.get("/logs")
async def get_system_logs(
    admin: dict = Depends(require_admin),
    page: int = 1,
    limit: int = 50,
    level: str | None = None,
    module: str | None = None,
):
    """Get system logs (paginated, filterable)."""
    sb = get_supabase_admin()
    offset = (page - 1) * limit

    query = sb.table("system_logs").select("*")
    if level:
        query = query.eq("level", level)
    if module:
        query = query.ilike("module", f"%{module}%")

    result = query.order("timestamp", desc=True).range(offset, offset + limit - 1).execute()

    count_query = sb.table("system_logs").select("id", count="exact")
    if level:
        count_query = count_query.eq("level", level)
    if module:
        count_query = count_query.ilike("module", f"%{module}%")
    count_result = count_query.execute()

    return {
        "items": result.data,
        "total": count_result.count or 0,
        "page": page,
        "limit": limit,
    }


# --- Hospital & Doctor CRUD (Admin) ---

@router.post("/hospitals")
async def create_hospital(body: HospitalCreate, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    result = sb.table("hospitals").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create hospital")
    return result.data[0]


@router.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: str, body: HospitalCreate, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    result = sb.table("hospitals").update(body.model_dump()).eq("id", hospital_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return result.data[0]


@router.delete("/hospitals/{hospital_id}")
async def delete_hospital(hospital_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    sb.table("hospitals").delete().eq("id", hospital_id).execute()
    return {"message": "Hospital deleted"}


@router.post("/doctors")
async def create_doctor(body: DoctorCreate, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    result = sb.table("doctors").insert(body.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create doctor")
    return result.data[0]


@router.put("/doctors/{doctor_id}")
async def update_doctor(doctor_id: str, body: DoctorCreate, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    result = sb.table("doctors").update(body.model_dump()).eq("id", doctor_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return result.data[0]


@router.delete("/doctors/{doctor_id}")
async def delete_doctor(doctor_id: str, admin: dict = Depends(require_admin)):
    sb = get_supabase_admin()
    sb.table("doctors").delete().eq("id", doctor_id).execute()
    return {"message": "Doctor deleted"}
