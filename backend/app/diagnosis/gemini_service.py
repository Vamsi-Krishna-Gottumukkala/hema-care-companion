import json
import asyncio
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

# Models to try in order (1.5-flash has higher free-tier quota, 2.0-flash is faster)
GEMINI_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]


def _get_model(model_name: str = "gemini-1.5-flash"):
    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(model_name)


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

def _validate_edge_cases(values: BloodValues) -> tuple[bool, str]:
    """Check for impossible or zero values before processing."""
    if any(v <= 0 for v in [values.wbc, values.rbc, values.hemoglobin, values.platelet]):
        return False, "Error: Standard blood parameters cannot be 0 or negative. Verify input."
    if values.wbc > 500 or values.rbc > 15 or values.hemoglobin > 30 or values.platelet > 4000:
        return False, "Error: One or more values strictly exceed biologically possible thresholds. Verify input."
    pct_sum = (values.neutrophils or 0) + (values.lymphocytes or 0) + (values.monocytes or 0) + (values.eosinophils or 0)
    if pct_sum > 100:
        return False, f"Error: Differential percentages sum to {pct_sum}% (cannot exceed 100%)."
    return True, ""


def _rule_based_diagnosis(values: BloodValues) -> dict:
    """
    Rule-based fallback diagnosis when Gemini API is unavailable.
    Uses established hematology criteria for blood cancer screening.
    """
    is_valid, err_msg = _validate_edge_cases(values)
    if not is_valid:
        return {
            "status": "not_detected",
            "cancer_type": "none",
            "risk_level": "low",
            "confidence_score": 0.0,
            "ai_explanation": [err_msg],
            "parameter_analysis": _build_parameter_analysis(values)
        }

    flagged_params = []
    notes = []

    # WBC
    if values.wbc >= 100.0:
        flagged_params.append("wbc_hyper")
        notes.append(f"WBC Count ({values.wbc} ×10³/µL) is critically elevated (hyperleukocytosis).")
    elif values.wbc > 11.0:
        flagged_params.append("wbc_high")
        notes.append(f"WBC Count ({values.wbc} ×10³/µL) is elevated.")
    elif values.wbc < 4.5:
        flagged_params.append("wbc_low")
        notes.append(f"WBC Count ({values.wbc} ×10³/µL) is below normal (leukopenia).")

    # RBC/Hgb
    if values.hemoglobin < 12.0 or values.rbc < 4.2:
        flagged_params.append("anemia")
        notes.append(f"Hemoglobin/RBC is below normal range, indicating anemia.")

    # Platelets
    if values.platelet < 150:
        flagged_params.append("plt_low")
        notes.append(f"Platelet Count ({values.platelet} ×10³/µL) is low (thrombocytopenia).")

    # Differentials
    if values.lymphocytes > 40:
        if values.lymphocytes > 60:
            flagged_params.append("lymph_very_high")
        else:
            flagged_params.append("lymph_high")
        notes.append(f"Lymphocytes ({values.lymphocytes}%) are elevated.")
        
    if values.neutrophils > 70:
        flagged_params.append("neut_high")
        notes.append(f"Neutrophils ({values.neutrophils}%) are elevated.")

    detected = False
    cancer_type = "none"
    risk_level = "low"
    confidence = 90

    if "wbc_hyper" in flagged_params:
        detected = True
        risk_level = "high"
        confidence = 88
        if "neut_high" in flagged_params:
            cancer_type = "CML"
            notes.append("Pattern suggests Chronic Myeloid Leukemia (CML) due to extreme WBC and high neutrophils.")
        elif "lymph_very_high" in flagged_params:
            cancer_type = "CLL"
            notes.append("Pattern suggests Chronic Lymphocytic Leukemia (CLL) due to extremely high WBC and lymphocytes.")
        else:
            cancer_type = "AML"
            notes.append("Pattern suggests acute leukemia. Immediate hematology consult required.")
            
    elif "anemia" in flagged_params and "plt_low" in flagged_params and ("wbc_high" in flagged_params or "wbc_low" in flagged_params):
        detected = True
        risk_level = "high"
        confidence = 75
        if "lymph_high" in flagged_params or "lymph_very_high" in flagged_params:
            cancer_type = "ALL"
            notes.append("Triad of cytopenias with high lymphocytes suggests Acute Lymphoblastic Leukemia (ALL).")
        else:
            cancer_type = "AML"
            notes.append("Triad of cytopenias with prominent neutrophil/myeloid shifts suggests Acute Myeloid Leukemia (AML).")
            
    elif "lymph_very_high" in flagged_params and "wbc_high" in flagged_params:
        detected = True
        risk_level = "medium"
        cancer_type = "CLL"
        confidence = 65
        notes.append("Mild/moderate leukocytosis with very high lymphocytes suggests Chronic Lymphocytic Leukemia (CLL).")
        
    elif len(flagged_params) >= 2:
        detected = False
        risk_level = "medium"
        cancer_type = "none"
        confidence = 50
        notes.append("Multiple parameters are abnormal. This requires medical evaluation to rule out hematologic disorders.")
        
    elif len(flagged_params) == 1:
        detected = False
        risk_level = "low"
        cancer_type = "none"
        confidence = 40
        notes.append("Slight abnormality in one parameter. Repeat test in a few weeks.")
        
    else:
        detected = False
        risk_level = "low"
        cancer_type = "none"
        confidence = 95
        notes.append("All parameters within normal ranges.")

    return {
        "status": "detected" if detected else "not_detected",
        "cancer_type": cancer_type,
        "risk_level": risk_level,
        "confidence_score": float(confidence),
        "ai_explanation": notes,
        "parameter_analysis": _build_parameter_analysis(values),
    }


async def _call_gemini_with_retry(prompt: str, image_part=None, max_retries: int = 3) -> str:
    """Try each Gemini model with exponential backoff on 429 errors."""
    safety = {
        "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
        "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
        "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
    }

    for model_name in GEMINI_MODELS:
        model = _get_model(model_name)
        for attempt in range(max_retries):
            try:
                content = [prompt, image_part] if image_part else prompt
                response = model.generate_content(content, safety_settings=safety)
                return response.text.strip()
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                    if attempt < max_retries - 1:
                        wait = 2 ** attempt  # 1s, 2s, 4s
                        await asyncio.sleep(wait)
                        continue
                    # This model is rate-limited — try next model
                    break
                # Non-rate-limit error — raise immediately
                raise

    # All models exhausted
    raise Exception("All Gemini models rate-limited. Using rule-based fallback.")


def _parse_gemini_json(text: str) -> dict:
    """Parse JSON from Gemini response, handling markdown code fences."""
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text.strip())


async def analyze_blood_values(values: BloodValues) -> dict:
    """Send blood values to Gemini for AI diagnosis, with rule-based fallback."""
    is_valid, err_msg = _validate_edge_cases(values)
    if not is_valid:
        return {
            "status": "not_detected",
            "cancer_type": "none",
            "risk_level": "low",
            "confidence_score": 0.0,
            "ai_explanation": [err_msg],
            "parameter_analysis": _build_parameter_analysis(values)
        }

    prompt = f"""You are an expert hematologist AI assistant. Analyze the following Complete Blood Count (CBC) results. Determine if there are indications of blood cancer (leukemia) or other disorders.

Patient CBC Results:
- WBC Count: {values.wbc} ×10³/µL (normal: 4.5-11.0)
- RBC Count: {values.rbc} ×10⁶/µL (normal: 4.2-5.9)
- Hemoglobin: {values.hemoglobin} g/dL (normal: 12.0-17.5)
- Platelet Count: {values.platelet} ×10³/µL (normal: 150-400)
- Neutrophils: {values.neutrophils}% (normal: 40-70%)
- Lymphocytes: {values.lymphocytes}% (normal: 20-40%)
- Monocytes: {values.monocytes}% (normal: 2-8%)
- Eosinophils: {values.eosinophils}% (normal: 1-4%)

Respond ONLY with valid JSON (no markdown, no extra text):
{{
  "status": "detected" or "not_detected",
  "cancer_type": "ALL" or "AML" or "CLL" or "CML" or "none",
  "risk_level": "high" or "medium" or "low",
  "confidence_score": <number 0-100>,
  "ai_explanation": ["<observation 1>", "<observation 2>", "<observation 3>", "<recommendation>"]
}}

Diagnostic Patterns to consider:
- ALL: High lymphocytes, usually combined with anemia (low RBC/Hgb) and thrombocytopenia (low PLT).
- AML: High neutrophils/blasts pattern, often with high WBC, low RBC, and low PLT.
- CLL: Mild to moderate WBC elevation with markedly high lymphocytes.
- CML: Very high WBC count with prominent neutrophils.
- MEDIUM Risk: Should be used for ambiguous cytopenias, moderate leukocytosis, or isolated significant abnormalities requiring follow-up.

Be medically accurate. If values are within normal ranges, status should be "not_detected", risk_level "low", with cancer_type "none". Provide 3-5 clinical points."""

    try:
        text = await _call_gemini_with_retry(prompt)
        result = _parse_gemini_json(text)
        result["status"] = result.get("status", "not_detected")
        result["cancer_type"] = result.get("cancer_type", "none")
        result["risk_level"] = result.get("risk_level", "low")
        result["confidence_score"] = float(result.get("confidence_score", 50.0))
        result["ai_explanation"] = result.get("ai_explanation", [])
        result["parameter_analysis"] = _build_parameter_analysis(values)
        return result

    except Exception:
        # Graceful fallback: rule-based clinical heuristics
        return _rule_based_diagnosis(values)


async def analyze_report_image(image_bytes: bytes, content_type: str) -> dict:
    """Use Gemini Vision to analyze a blood report image, with fallback."""
    import base64

    prompt = """You are an expert hematologist AI. Analyze this blood test report image.

1. Extract the following blood parameters if visible: WBC, RBC, Hemoglobin, Platelet Count, Neutrophils, Lymphocytes, Monocytes, Eosinophils.
2. Based on the extracted values, determine if there are indications of blood cancer or other disorders. Use MEDIUM risk level for moderate/ambiguous abnormalities.

Diagnostic Patterns to consider:
- ALL: High lymphocytes + low RBC/PLT.
- AML: High neutrophils pattern + high WBC + low RBC/PLT.
- CLL: Moderate WBC + very high lymphocytes.
- CML: Very high WBC + high neutrophils.

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
  "confidence_score": <number 0-100>,
  "ai_explanation": ["<observation 1>", "<observation 2>", "<recommendation>"]
}"""

    image_part = {
        "mime_type": content_type if not content_type.endswith("pdf") else "image/jpeg",
        "data": base64.b64encode(image_bytes).decode("utf-8"),
    }

    try:
        text = await _call_gemini_with_retry(prompt, image_part=image_part)
        result = _parse_gemini_json(text)

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
        
        # We can't strict validate edge cases on OCR easily because some might be missing (0s)
        # But we build analysis safely
        result["parameter_analysis"] = _build_parameter_analysis(blood_vals)
        result["extracted_values"] = extracted
        
        # Check risk level
        result["status"] = result.get("status", "not_detected")
        result["cancer_type"] = result.get("cancer_type", "none")
        result["risk_level"] = result.get("risk_level", "low")
        result["confidence_score"] = float(result.get("confidence_score", 50.0))
        result["ai_explanation"] = result.get("ai_explanation", [])

        return result

    except Exception as e:
        raise ValueError("Could not analyze the uploaded image. Please ensure the file is a clear blood report or try manually entering the values.")
