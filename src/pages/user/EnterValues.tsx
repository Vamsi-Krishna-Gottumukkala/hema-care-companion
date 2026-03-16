import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, AlertCircle, CheckCircle, Info, Microscope, RotateCcw } from "lucide-react";
import { defaultBloodValues, normalRanges } from "@/data/mockData";

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
  const [values, setValues] = useState<Record<FieldKey, string>>(defaultBloodValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach(({ key }) => {
      const v = values[key];
      if (!v) { newErrors[key] = "Required"; return; }
      if (isNaN(Number(v)) || Number(v) < 0) { newErrors[key] = "Must be a positive number"; return; }
    });
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
    await new Promise((r) => setTimeout(r, 1000));
    navigate("/diagnosis");
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

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn-primary px-8">
            <Microscope className="h-4 w-4" />
            {submitting ? "Analyzing..." : "Run AI Diagnosis"}
          </button>
          <button type="button" onClick={() => setValues(defaultBloodValues)} className="btn-secondary">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnterValues;
