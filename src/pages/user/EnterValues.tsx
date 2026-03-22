import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, AlertCircle, CheckCircle, Info, Microscope, RotateCcw, Loader2 } from "lucide-react";
import { diagnosisApi, type BloodValues } from "@/services/api";

const normalRanges: Record<string, { min: number; max: number; unit: string }> = {
  wbc: { min: 4.0, max: 11.0, unit: "×10³/µL" },
  rbc: { min: 4.5, max: 5.5, unit: "×10⁶/µL" },
  hemoglobin: { min: 12.0, max: 17.5, unit: "g/dL" },
  platelet: { min: 150, max: 400, unit: "×10³/µL" },
  neutrophils: { min: 40, max: 70, unit: "%" },
  lymphocytes: { min: 20, max: 40, unit: "%" },
  monocytes: { min: 2, max: 8, unit: "%" },
  eosinophils: { min: 1, max: 4, unit: "%" },
};

const defaultBloodValues: Record<string, string> = {
  wbc: "", rbc: "", hemoglobin: "", platelet: "",
  neutrophils: "", lymphocytes: "", monocytes: "", eosinophils: "",
};

const fields = [
  { key: "wbc", label: "WBC Count", description: "White Blood Cell Count" },
  { key: "rbc", label: "RBC Count", description: "Red Blood Cell Count" },
  { key: "hemoglobin", label: "Hemoglobin", description: "Hemoglobin Level" },
  { key: "platelet", label: "Platelet Count", description: "Thrombocyte Count" },
  { key: "neutrophils", label: "Neutrophils", description: "Neutrophil Percentage" },
  { key: "lymphocytes", label: "Lymphocytes", description: "Lymphocyte Percentage" },
  { key: "monocytes", label: "Monocytes", description: "Monocyte Percentage" },
  { key: "eosinophils", label: "Eosinophils", description: "Eosinophil Percentage" },
] as const;

type FieldKey = keyof typeof defaultBloodValues;

const EnterValues = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<FieldKey, string>>({ ...defaultBloodValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach(({ key }) => {
      const vStr = values[key as FieldKey];
      if (!vStr) { newErrors[key] = "Required"; return; }
      const v = Number(vStr);
      if (isNaN(v) || v <= 0) { newErrors[key] = "Must be > 0"; return; }
      
      // Plausible max limits
      if (key === 'wbc' && v > 500) newErrors[key] = "Value too high (>500)";
      if (key === 'rbc' && v > 15) newErrors[key] = "Value too high (>15)";
      if (key === 'hemoglobin' && v > 30) newErrors[key] = "Value too high (>30)";
      if (key === 'platelet' && v > 3000) newErrors[key] = "Value too high (>3000)";
      if (['neutrophils', 'lymphocytes', 'monocytes', 'eosinophils'].includes(key) && v > 100) {
        newErrors[key] = "Max 100%";
      }
    });

    const neut = Number(values.neutrophils) || 0;
    const lymph = Number(values.lymphocytes) || 0;
    const mono = Number(values.monocytes) || 0;
    const eos = Number(values.eosinophils) || 0;
    if (neut + lymph + mono + eos > 100) {
       setSubmitError("Differential percentages cannot sum to more than 100%.");
       setErrors(newErrors);
       return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStatus = (key: FieldKey): "normal" | "low" | "high" | "empty" => {
    const v = parseFloat(values[key]);
    if (!values[key] || isNaN(v)) return "empty";
    const range = normalRanges[key];
    if (v < range.min) return "low";
    if (v > range.max) return "high";
    return "normal";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const bloodValues: BloodValues = {
        wbc: Number(values.wbc),
        rbc: Number(values.rbc),
        hemoglobin: Number(values.hemoglobin),
        platelet: Number(values.platelet),
        neutrophils: Number(values.neutrophils),
        lymphocytes: Number(values.lymphocytes),
        monocytes: Number(values.monocytes),
        eosinophils: Number(values.eosinophils),
      };
      const result = await diagnosisApi.submitBloodValues(bloodValues);
      navigate(`/diagnosis?id=${result.id}`);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillSample = () => {
    setValues({ wbc: "12.4", rbc: "3.8", hemoglobin: "9.2", platelet: "98", neutrophils: "78", lymphocytes: "15", monocytes: "5", eosinophils: "2" });
    setErrors({});
  };

  const completedCount = fields.filter((f) => values[f.key]).length;
  const progressPct = (completedCount / fields.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-foreground">Enter Blood Parameters</h1>
              <p className="text-sm text-muted-foreground">Manually enter your blood test values for AI analysis</p>
            </div>
          </div>
          <button onClick={fillSample} className="btn-secondary text-xs gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Fill Sample
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="medical-card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium text-foreground">Form Completion</span>
          <span className="text-primary font-semibold">{completedCount}/{fields.length}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {fields.map(({ key, label, description }) => {
            const status = getStatus(key as FieldKey);
            const range = normalRanges[key as FieldKey];
            return (
              <div key={key} className={`medical-card p-4 transition-all ${status === "high" || status === "low" ? "border-warning/40" : status === "normal" ? "border-success/30" : ""}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-sm font-semibold text-foreground">{label}</label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {status === "normal" && <CheckCircle className="h-4 w-4 text-success" />}
                    {(status === "high" || status === "low") && <AlertCircle className="h-4 w-4 text-warning" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={values[key as FieldKey]}
                    onChange={(e) => {
                      setValues({ ...values, [key]: e.target.value });
                      if (errors[key]) setErrors({ ...errors, [key]: "" });
                    }}
                    className={`medical-input flex-1 ${errors[key] ? "border-danger focus:ring-danger/30" : status === "normal" ? "border-success/40" : status !== "empty" ? "border-warning/40" : ""}`}
                    placeholder={`e.g. ${range.min}`}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-2.5 rounded-lg border border-border">
                    {range.unit}
                  </span>
                </div>
                {errors[key] && (
                  <p className="text-xs text-danger mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors[key]}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Normal: {range.min} – {range.max} {range.unit}</p>
                  {status === "high" && <span className="text-xs text-danger ml-auto font-medium">↑ High</span>}
                  {status === "low" && <span className="text-xs text-danger ml-auto font-medium">↓ Low</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> Normal range</div>
          <div className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-warning" /> Outside normal range</div>
          <div className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-danger" /> Requires attention</div>
        </div>

        {submitError && (
          <div className="bg-danger-light border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm mb-4">
            {submitError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Microscope className="h-4 w-4" /> Run AI Diagnosis</>}
          </button>
          <button type="button" onClick={() => setValues({ ...defaultBloodValues })} className="btn-secondary">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnterValues;
