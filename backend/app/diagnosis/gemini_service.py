import json
import google.generativeai as genai
from app.config import get_settings
from app.diagnosis.models import BloodValues

_model = None

NORMAL_RANGES = {
    "wbc": {"min": 4.5, "max": 11.0, "unit": "×10³/µL"},
    "rbc": {"min": 4.2, "max": 5.9, "unit": "×10⁶/µL"},
    "hemoglobin": {"min": 12.0, "max": 17.5, "unit": "g/dL"},
    "platelet": {"min": 150, "max": 400, "unit": "×10³/µL"},
    "neutrophils": {"min": 40, "max": 70, "unit": "%"},
    "lymphocytes": {"min": 20, "max": 40, "unit": "%"},
    "monocytes": {"min": 2, "max": 8, "unit": "%"},
    "eosinophils": {"min": 1, "max": 4, "unit": "%"},
}


def _get_model():
    global _model
    if _model is None:
        settings = get_settings()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-2.0-flash")
    return _model


def _build_parameter_analysis(values: BloodValues) -> list[dict]:
    """Build parameter analysis comparing patient values to normal ranges."""
    analysis = []
    for field_name, ranges in NORMAL_RANGES.items():
        value = getattr(values, field_name)
        flagged = value < ranges["min"] or value > ranges["max"]
        analysis.append({
            "param": field_name.upper() if len(field_name) <= 3 else field_name.capitalize(),
            "value": value,
            "normal_min": ranges["min"],
            "normal_max": ranges["max"],
            "unit": ranges["unit"],
            "flagged": flagged,
        })
    return analysis


async def analyze_blood_values(values: BloodValues) -> dict:
    """Send blood values to Gemini for AI diagnosis."""
    model = _get_model()

    prompt = f"""You are an expert hematologist AI assistant. Analyze the following Complete Blood Count (CBC) results and determine if there are indications of blood cancer (leukemia).

Patient CBC Results:
- WBC Count: {values.wbc} ×10³/µL (normal: 4.5-11.0)
- RBC Count: {values.rbc} ×10⁶/µL (normal: 4.2-5.9)
- Hemoglobin: {values.hemoglobin} g/dL (normal: 12.0-17.5)
- Platelet Count: {values.platelet} ×10³/µL (normal: 150-400)
- Neutrophils: {values.neutrophils}% (normal: 40-70%)
- Lymphocytes: {values.lymphocytes}% (normal: 20-40%)
- Monocytes: {values.monocytes}% (normal: 2-8%)
- Eosinophils: {values.eosinophils}% (normal: 1-4%)

Based on this data, respond ONLY with valid JSON in the following format (no markdown, no extra text):
{{
  "status": "detected" or "not_detected",
  "cancer_type": "ALL" or "AML" or "CLL" or "CML" or "none",
  "risk_level": "high" or "medium" or "low",
  "confidence_score": <number between 0 and 100>,
  "ai_explanation": [
    "<clinical observation 1>",
    "<clinical observation 2>",
    "<clinical observation 3>",
    "<recommendation>"
  ]
}}

Important: Be medically accurate. If values are within normal ranges, status should be "not_detected" with cancer_type "none". Provide 3-5 clinical explanation points."""

    try:
        response = model.generate_content(
            prompt,
            safety_settings={
                "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
            },
        )

        text = response.text.strip()
        # Clean markdown formatting if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]  # Remove first line ```json
            text = text.rsplit("```", 1)[0]  # Remove trailing ```
            text = text.strip()

        result = json.loads(text)

        # Validate and normalize
        result["status"] = result.get("status", "not_detected")
        result["cancer_type"] = result.get("cancer_type", "none")
        result["risk_level"] = result.get("risk_level", "low")
        result["confidence_score"] = float(result.get("confidence_score", 50.0))
        result["ai_explanation"] = result.get("ai_explanation", ["Analysis could not be completed."])
        result["parameter_analysis"] = _build_parameter_analysis(values)

        return result

    except Exception as e:
        # Fallback: return a safe result if Gemini fails
        return {
            "status": "not_detected",
            "cancer_type": "none",
            "risk_level": "low",
            "confidence_score": 0.0,
            "ai_explanation": [
                f"AI analysis encountered an error: {str(e)}",
                "Please consult a medical professional for proper evaluation.",
            ],
            "parameter_analysis": _build_parameter_analysis(values),
        }


async def analyze_report_image(image_bytes: bytes, content_type: str) -> dict:
    """Use Gemini Vision to analyze a blood report image."""
    model = _get_model()

    prompt = """You are an expert hematologist AI. Analyze this blood test report image.

1. Extract the following blood parameters if visible: WBC, RBC, Hemoglobin, Platelet Count, Neutrophils, Lymphocytes, Monocytes, Eosinophils.
2. Based on the extracted values, determine if there are indications of blood cancer.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "extracted_values": {
    "wbc": <number or null>,
    "rbc": <number or null>,
    "hemoglobin": <number or null>,
    "platelet": <number or null>,
    "neutrophils": <number or null>,
    "lymphocytes": <number or null>,
    "monocytes": <number or null>,
    "eosinophils": <number or null>
  },
  "status": "detected" or "not_detected",
  "cancer_type": "ALL" or "AML" or "CLL" or "CML" or "none",
  "risk_level": "high" or "medium" or "low",
  "confidence_score": <number between 0 and 100>,
  "ai_explanation": [
    "<clinical observation 1>",
    "<clinical observation 2>",
    "<recommendation>"
  ]
}"""

    try:
        import base64
        image_part = {
            "mime_type": content_type,
            "data": base64.b64encode(image_bytes).decode("utf-8"),
        }

        response = model.generate_content(
            [prompt, image_part],
            safety_settings={
                "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
            },
        )

        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0]
            text = text.strip()

        result = json.loads(text)

        # Build parameter analysis from extracted values
        extracted = result.get("extracted_values", {})
        blood_vals = BloodValues(
            wbc=extracted.get("wbc") or 0,
            rbc=extracted.get("rbc") or 0,
            hemoglobin=extracted.get("hemoglobin") or 0,
            platelet=extracted.get("platelet") or 0,
            neutrophils=extracted.get("neutrophils") or 0,
            lymphocytes=extracted.get("lymphocytes") or 0,
            monocytes=extracted.get("monocytes") or 0,
            eosinophils=extracted.get("eosinophils") or 0,
        )
        result["parameter_analysis"] = _build_parameter_analysis(blood_vals)
        result["extracted_values"] = extracted

        return result

    except Exception as e:
        return {
            "status": "not_detected",
            "cancer_type": "none",
            "risk_level": "low",
            "confidence_score": 0.0,
            "ai_explanation": [f"Image analysis error: {str(e)}"],
            "parameter_analysis": [],
            "extracted_values": {},
        }
