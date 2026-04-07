import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image as ImageIcon, X, Eye, CheckCircle, Loader2, Microscope, AlertCircle } from "lucide-react";
import { diagnosisApi } from "@/services/api";

const BloodSmearScan = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = (f: File) => {
    if (!f) return;
    setFile(f);
    setStage("idle");
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

  const processScan = async () => {
    if (!file) return;
    setStage("processing");
    setErrorMsg("");
    try {
      const result = await diagnosisApi.uploadBloodSmear(file);
      setDiagnosisId(result.id);
      setStage("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to analyze smear.");
      setStage("error");
    }
  };

  const proceedToDiagnosis = () => {
    if (diagnosisId) navigate(`/diagnosis?id=${diagnosisId}`);
    else navigate("/diagnosis");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Microscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Blood Smear Photo Scan</h1>
            <p className="text-sm text-muted-foreground">Upload a microscopic photo of a blood smear and our AI will analyze cell morphologies.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <div className="medical-card p-6">
            <h2 className="font-semibold text-foreground mb-4">Select Microscopic Image</h2>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`upload-zone block ${dragActive ? "drag-active" : ""}`}
            >
              <input type="file" accept="image/*" className="hidden" onChange={handleInputChange} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Drag & drop or click to upload</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, TIFF, WEBP (max 10MB)</p>
                </div>
              </div>
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={() => { setFile(null); setPreview(null); setStage("idle"); setErrorMsg(""); }}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}

            {stage === "idle" && file && (
              <button onClick={processScan} className="btn-primary w-full mt-4">
                <Microscope className="h-4 w-4" /> Analyze Slide with AI View
              </button>
            )}

            {stage === "processing" && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-foreground font-medium">Analyzing cell morphology using Vision AI...</span>
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
            <h3 className="text-sm font-semibold text-foreground mb-3">Slide Guidelines</h3>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Good lighting and high contrast</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Properly stained (e.g., Wright-Giemsa)</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Minimum 400x magnification recommended</div>
              <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Clear visibility of leukocytes and erythrocytes</div>
            </div>
          </div>
        </div>

        {/* Preview & Extracted */}
        <div className="space-y-4">
          {preview && (
            <div className="medical-card p-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-primary" /> Microscopic Image Preview
              </h3>
              <div className="rounded-lg overflow-hidden border border-border bg-black/5 flex items-center justify-center p-2">
                 <img src={preview} alt="Blood Smear Preview" className="w-full max-h-[400px] object-scale-down rounded" />
              </div>
            </div>
          )}

          {stage === "done" && (
            <div className="medical-card p-5 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Analysis Complete!</h3>
              <p className="text-muted-foreground text-sm mb-6">Our AI Vision model has completed interpreting the cell morphologies on your slide.</p>
              <button onClick={proceedToDiagnosis} className="btn-primary w-full shadow-lg shadow-primary/25">
                <Microscope className="h-4 w-4" /> View AI Diagnosis Result
              </button>
            </div>
          )}

          {!file && stage === "idle" && (
            <div className="medical-card p-6 text-center h-[280px] flex flex-col justify-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium text-foreground">Image Preview</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a microscopic photo to see the visual preview and analysis results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodSmearScan;
