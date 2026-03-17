from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.auth.dependencies import get_current_user
from app.diagnosis.models import BloodValues
from app.diagnosis.gemini_service import analyze_blood_values, analyze_report_image
from app.database import get_supabase_admin

router = APIRouter(prefix="/api/diagnosis", tags=["Diagnosis"])


def _log(module: str, level: str, message: str, user_id: str | None = None):
    """Write a log entry to system_logs table."""
    try:
        sb = get_supabase_admin()
        sb.table("system_logs").insert({
            "level": level,
            "module": module,
            "message": message,
            "user_id": user_id,
        }).execute()
    except Exception:
        pass  # Logging failures shouldn't break requests


@router.post("/blood-values")
async def diagnose_blood_values(body: BloodValues, user: dict = Depends(get_current_user)):
    """Submit blood parameters for AI diagnosis."""
    _log("AI Engine", "INFO", f"Blood value diagnosis started for user {user['email']}", user["id"])

    result = await analyze_blood_values(body)

    # Save diagnosis to DB
    sb = get_supabase_admin()
    diagnosis_data = {
        "user_id": user["id"],
        "input_type": "manual",
        "wbc": body.wbc,
        "rbc": body.rbc,
        "hemoglobin": body.hemoglobin,
        "platelet": body.platelet,
        "neutrophils": body.neutrophils,
        "lymphocytes": body.lymphocytes,
        "monocytes": body.monocytes,
        "eosinophils": body.eosinophils,
        "status": result["status"],
        "cancer_type": result["cancer_type"],
        "risk_level": result["risk_level"],
        "confidence_score": result["confidence_score"],
        "ai_explanation": result["ai_explanation"],
        "parameter_analysis": result["parameter_analysis"],
    }

    insert = sb.table("diagnoses").insert(diagnosis_data).execute()
    if not insert.data:
        raise HTTPException(status_code=500, detail="Failed to save diagnosis")

    saved = insert.data[0]
    _log("AI Engine", "INFO",
         f"Diagnosis completed for {user['email']} - {result['cancer_type']} "
         f"{'detected' if result['status'] == 'detected' else 'not detected'} "
         f"({result['confidence_score']}% confidence)", user["id"])

    return {
        "id": saved["id"],
        "user_id": saved["user_id"],
        "input_type": saved["input_type"],
        "result": result,
        "created_at": saved["created_at"],
    }


@router.post("/upload-report")
async def diagnose_upload_report(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload blood report image/PDF for OCR + AI analysis."""
    if not file.content_type:
        raise HTTPException(status_code=400, detail="File type not detected")

    allowed = ["image/jpeg", "image/png", "image/tiff", "image/webp", "application/pdf"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    _log("OCR Engine", "INFO", f"Report upload processing for {user['email']}", user["id"])

    image_bytes = await file.read()

    # Upload to Supabase Storage
    sb = get_supabase_admin()
    file_path = f"reports/{user['id']}/{file.filename}"
    try:
        sb.storage.from_("uploads").upload(file_path, image_bytes, {"content-type": file.content_type})
        file_url = f"{sb.supabase_url}/storage/v1/object/public/uploads/{file_path}"
    except Exception:
        file_url = None

    # Analyze with Gemini Vision
    result = await analyze_report_image(image_bytes, file.content_type)

    # Extract blood values from result
    extracted = result.get("extracted_values", {})

    diagnosis_data = {
        "user_id": user["id"],
        "input_type": "report_upload",
        "wbc": extracted.get("wbc"),
        "rbc": extracted.get("rbc"),
        "hemoglobin": extracted.get("hemoglobin"),
        "platelet": extracted.get("platelet"),
        "neutrophils": extracted.get("neutrophils"),
        "lymphocytes": extracted.get("lymphocytes"),
        "monocytes": extracted.get("monocytes"),
        "eosinophils": extracted.get("eosinophils"),
        "report_file_url": file_url,
        "status": result.get("status", "not_detected"),
        "cancer_type": result.get("cancer_type", "none"),
        "risk_level": result.get("risk_level", "low"),
        "confidence_score": result.get("confidence_score", 0),
        "ai_explanation": result.get("ai_explanation", []),
        "parameter_analysis": result.get("parameter_analysis", []),
    }

    insert = sb.table("diagnoses").insert(diagnosis_data).execute()
    if not insert.data:
        raise HTTPException(status_code=500, detail="Failed to save diagnosis")

    saved = insert.data[0]
    _log("OCR Engine", "INFO",
         f"Report processed for {user['email']} - {len(extracted)} parameters extracted", user["id"])

    return {
        "id": saved["id"],
        "user_id": saved["user_id"],
        "input_type": saved["input_type"],
        "extracted_values": extracted,
        "report_file_url": file_url,
        "result": result,
        "created_at": saved["created_at"],
    }


@router.get("/history")
async def get_diagnosis_history(
    user: dict = Depends(get_current_user),
    page: int = 1,
    limit: int = 20,
):
    """Get user's diagnosis history."""
    sb = get_supabase_admin()
    offset = (page - 1) * limit

    result = sb.table("diagnoses") \
        .select("*") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .range(offset, offset + limit - 1) \
        .execute()

    # Get total count
    count_result = sb.table("diagnoses") \
        .select("id", count="exact") \
        .eq("user_id", user["id"]) \
        .execute()

    return {
        "items": result.data,
        "total": count_result.count or 0,
        "page": page,
        "limit": limit,
    }


@router.get("/{diagnosis_id}")
async def get_diagnosis_detail(
    diagnosis_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a specific diagnosis result."""
    sb = get_supabase_admin()
    result = sb.table("diagnoses").select("*").eq("id", diagnosis_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    diagnosis = result.data[0]

    # Users can only see their own diagnoses (admins can see all)
    if user["role"] != "admin" and diagnosis["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return diagnosis
