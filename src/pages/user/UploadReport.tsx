import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, X, Eye, CheckCircle, Loader2, Microscope, AlertCircle } from "lucide-react";
import { diagnosisApi } from "@/services/api";

const paramLabels: Record<string, string> = {
  wbc: "WBC Count", rbc: "RBC Count", hemoglobin: "Hemoglobin",
  platelet: "Platelet Count", neutrophils: "Neutrophils",
  lymphocytes: "Lymphocytes", monocytes: "Monocytes", eosinophils: "Eosinophils",
};
const paramUnits: Record<string, string> = {
  wbc: "×10³/µL", rbc: "×10⁶/µL", hemoglobin: "g/dL", platelet: "×10³/µL",
  neutrophils: "%", lymphocytes: "%", monocytes: "%", eosinophils: "%",
};
const normalRanges: Record<string, { min: number; max: number }> = {
  wbc: { min: 4.0, max: 11.0 }, rbc: { min: 4.5, max: 5.5 },
  hemoglobin: { min: 12.0, max: 17.5 }, platelet: { min: 150, max: 400 },
  neutrophils: { min: 40, max: 70 }, lymphocytes: { min: 20, max: 40 },
  monocytes: { min: 2, max: 8 }, eosinophils: { min: 1, max: 4 },
};

const UploadReport = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [extracted, setExtracted] = useState<Record<string, number | null> | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (f: File) => {
    if (!f) return;
    setFile(f);
    setStage("idle");
    setExtracted(null);
    setErrorMsg("");
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const processReport = async () => {
    if (!file) return;
    setStage("processing");
    setErrorMsg("");
    try {
      const result = await diagnosisApi.uploadReport(file);
      setExtracted(result.extracted_values || {});
      setDiagnosisId(result.id);
      setStage("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to process report.");
      setStage("error");
    }
  };

  const proceedToDiagnosis = () => {
    if (diagnosisId) navigate(`/diagnosis?id=${diagnosisId}`);
    else navigate("/diagnosis");
  };

  const abnormalCount = extracted ? Object.entries(extracted).filter(([key, val]) => {
    if (val === null || val === undefined) return false;
    const range = normalRanges[key];
    if (!range) return false;
    return val < range.min || val > range.max;
  }).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Upload Blood Report</h1>
            <p className="text-sm text-muted-foreground">Upload your blood test report and our AI will extract the parameters automatically</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div className="medical-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Select Report File</h2>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`upload-zone block ${dragActive ? "drag-active" : ""}`}
            >
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleInputChange} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports PDF, JPG, PNG, TIFF (max 10MB)</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> PDF</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Image className="h-3 w-3" /> Images</span>
                </div>
              </div>
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => { setFile(null); setPreview(null); setStage("idle"); setExtracted(null); setErrorMsg(""); }}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}

            {stage === "idle" && file && (
              <button onClick={processReport} className="btn-primary w-full mt-4">
                <Microscope className="h-4 w-4" /> Process Report with AI-OCR
              </button>
            )}

            {stage === "processing" && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-foreground font-medium">Extracting blood parameters with AI Engine...</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["WBC", "RBC", "HGB", "PLT", "NEU", "LYM", "MON", "EOS"].map((p) => (
                    <div key={p} className="bg-muted/50 rounded-lg p-2 text-center animate-pulse">
                      <p className="text-xs text-muted-foreground">{p}</p>
                      <div className="h-4 bg-muted rounded mt-1 mx-auto w-8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stage === "error" && (
              <div className="mt-4 bg-danger-light border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="medical-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Supported Lab Reports</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {["LabCorp CBC Reports", "Quest Diagnostics", "Hospital Discharge Summary", "Routine Blood Panel", "Complete Blood Count (CBC)", "Hematology Reports"].map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Extracted */}
        <div className="space-y-4">
          {preview && (
            <div className="medical-card p-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" /> Report Preview
              </h3>
              <img src={preview} alt="Report" className="w-full rounded-lg border border-border max-h-64 object-contain bg-muted" />
            </div>
          )}

          {stage === "done" && extracted && (
            <div className="medical-card p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-success" />
                <h3 className="font-semibold text-foreground">Extracted Blood Parameters</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(extracted).map(([key, val]) => {
                  const range = normalRanges[key];
                  const flagged = val !== null && val !== undefined && range && (val < range.min || val > range.max);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${flagged ? "border-danger/30 bg-danger-light" : "border-border bg-muted/30"}`}>
                      <p className="text-xs text-muted-foreground">{paramLabels[key] || key}</p>
                      <p className={`text-lg font-bold font-display ${flagged ? "text-danger" : "text-foreground"}`}>
                        {val !== null && val !== undefined ? val : "—"} <span className="text-xs font-normal text-muted-foreground">{paramUnits[key]}</span>
                      </p>
                      {flagged && <p className="text-xs text-danger mt-0.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Abnormal</p>}
                    </div>
                  );
                })}
              </div>
              {abnormalCount > 0 && (
                <div className="bg-warning-light border border-warning/20 rounded-lg p-3 mb-4 text-xs text-warning flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{abnormalCount} parameter{abnormalCount > 1 ? "s are" : " is"} outside normal range. AI analysis complete.</span>
                </div>
              )}
              <button onClick={proceedToDiagnosis} className="btn-primary w-full">
                <Microscope className="h-4 w-4" /> View AI Diagnosis Result
              </button>
            </div>
          )}

          {!file && stage === "idle" && (
            <div className="medical-card p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Preview Area</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a report to see preview and extracted values</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
