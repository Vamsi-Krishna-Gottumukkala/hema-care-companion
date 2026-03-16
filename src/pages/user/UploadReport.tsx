import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Image, X, Eye, CheckCircle, Loader2, Microscope, AlertCircle } from "lucide-react";

const UploadReport = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "uploading" | "processing" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [extracted, setExtracted] = useState<Record<string, string> | null>(null);

  const handleFile = (f: File) => {
    if (!f) return;
    setFile(f);
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
    setStage("uploading");
    setProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(i);
    }
    setStage("processing");
    await new Promise((r) => setTimeout(r, 2000));
    setExtracted({
      wbc: "12.4", rbc: "3.8", hemoglobin: "9.2", platelet: "98",
      neutrophils: "78", lymphocytes: "15", monocytes: "5", eosinophils: "2",
    });
    setStage("done");
  };

  const proceedToDiagnosis = () => navigate("/diagnosis");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
                <button onClick={() => { setFile(null); setPreview(null); setStage("idle"); setExtracted(null); }}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}

            {stage === "idle" && file && (
              <button onClick={processReport} className="btn-primary w-full mt-4">
                <Microscope className="h-4 w-4" /> Process Report with AI-OCR
              </button>
            )}

            {(stage === "uploading" || stage === "processing") && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {stage === "uploading" ? "Uploading report..." : "Extracting blood parameters..."}
                  </span>
                  <span className="text-primary font-semibold">{stage === "uploading" ? `${progress}%` : ""}</span>
                </div>
                {stage === "uploading" && (
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {stage === "processing" && (
                  <div className="grid grid-cols-4 gap-2">
                    {["WBC", "RBC", "HGB", "PLT", "NEU", "LYM", "MON", "EOS"].map((p) => (
                      <div key={p} className="bg-muted/50 rounded-lg p-2 text-center animate-pulse">
                        <p className="text-xs text-muted-foreground">{p}</p>
                        <div className="h-4 bg-muted rounded mt-1 mx-auto w-8" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supported Formats */}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Report Preview
                </h3>
              </div>
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
                  const labels: Record<string, string> = {
                    wbc: "WBC Count", rbc: "RBC Count", hemoglobin: "Hemoglobin",
                    platelet: "Platelet Count", neutrophils: "Neutrophils",
                    lymphocytes: "Lymphocytes", monocytes: "Monocytes", eosinophils: "Eosinophils",
                  };
                  const units: Record<string, string> = {
                    wbc: "×10³/µL", rbc: "×10⁶/µL", hemoglobin: "g/dL", platelet: "×10³/µL",
                    neutrophils: "%", lymphocytes: "%", monocytes: "%", eosinophils: "%",
                  };
                  const flagged = (key === "wbc" && parseFloat(val) > 11) || (key === "hemoglobin" && parseFloat(val) < 12) || (key === "platelet" && parseFloat(val) < 150);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${flagged ? "border-danger/30 bg-danger-light" : "border-border bg-muted/30"}`}>
                      <p className="text-xs text-muted-foreground">{labels[key]}</p>
                      <p className={`text-lg font-bold font-display ${flagged ? "text-danger" : "text-foreground"}`}>
                        {val} <span className="text-xs font-normal text-muted-foreground">{units[key]}</span>
                      </p>
                      {flagged && <p className="text-xs text-danger mt-0.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Abnormal</p>}
                    </div>
                  );
                })}
              </div>
              <div className="bg-warning-light border border-warning/20 rounded-lg p-3 mb-4 text-xs text-warning flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>3 parameters are outside normal range. Running AI analysis recommended.</span>
              </div>
              <button onClick={proceedToDiagnosis} className="btn-primary w-full">
                <Microscope className="h-4 w-4" /> Run AI Diagnosis
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
