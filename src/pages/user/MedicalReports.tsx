import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FileText, Download, Printer, User, Activity, AlertTriangle,
  CheckCircle, Microscope, Building2, Brain, Shield, Loader2
} from "lucide-react";
import { diagnosisApi, authApi, reportsApi, getToken, type DiagnosisRecord, type UserData } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const fullReportUrl = (url: string) => {
  const token = getToken();
  const base = url.startsWith("/") ? `${API_BASE}${url}` : url;
  return token ? `${base}?token=${token}` : base;
};

const normalRanges: Record<string, { min: number; max: number; unit: string; label: string }> = {
  wbc: { min: 4.5, max: 11.0, unit: "×10³/µL", label: "WBC Count" },
  rbc: { min: 4.2, max: 5.9, unit: "×10⁶/µL", label: "RBC Count" },
  hemoglobin: { min: 12.0, max: 17.5, unit: "g/dL", label: "Hemoglobin" },
  platelet: { min: 150, max: 400, unit: "×10³/µL", label: "Platelet Count" },
  neutrophils: { min: 40, max: 70, unit: "%", label: "Neutrophils" },
  lymphocytes: { min: 20, max: 40, unit: "%", label: "Lymphocytes" },
  monocytes: { min: 2, max: 8, unit: "%", label: "Monocytes" },
  eosinophils: { min: 1, max: 4, unit: "%", label: "Eosinophils" },
};

const MedicalReports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const diagnosisId = searchParams.get("id");

  const [diagnosis, setDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<DiagnosisRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load user profile
        const userData = await authApi.getMe();
        setUser(userData);

        // Load diagnosis and history
        const historyRes = await diagnosisApi.getHistory(1, 20);
        setHistory(historyRes.items);
        
        let diag: DiagnosisRecord;
        if (diagnosisId) {
          diag = await diagnosisApi.getDetail(diagnosisId);
        } else {
          if (historyRes.items.length === 0) {
            setError("No diagnosis found. Run a test first.");
            setLoading(false);
            return;
          }
          diag = historyRes.items[0];
        }
        setDiagnosis(diag);
        setLoading(false);

        // Auto-generate report
        setGenerating(true);
        try {
          const r = await reportsApi.generate(diag.id);
          setReportUrl(r.report_url ? fullReportUrl(r.report_url) : null);
        } catch {
          // Report generation failed silently — user can still see data
        } finally {
          setGenerating(false);
        }
      } catch (err) {
        setError("Failed to load report.");
        setLoading(false);
      }
    };
    loadData();
  }, [diagnosisId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center animate-pulse-slow">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground">Loading report...</p>
        <p className="text-sm text-muted-foreground">Fetching your diagnosis data</p>
      </div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div className="medical-card p-10 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Report Found</h3>
        <p className="text-sm text-muted-foreground">{error || "Please run a diagnosis first."}</p>
      </div>
    );
  }

  const isDetected = diagnosis.status === "detected";
  const reportDate = diagnosis.created_at
    ? new Date(diagnosis.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "Unknown Date";

  // Build blood parameter rows from raw values + parameter_analysis fallback
  const paramRows = (diagnosis.parameter_analysis || []).map((p) => ({
    label: p.param,
    value: String(p.value),
    low: String(p.normal_min),
    high: String(p.normal_max),
    unit: p.unit,
    status: p.flagged ? (p.value > p.normal_max ? "High" : "Low") : "Normal",
  }));

  // Fallback: build from raw values if parameter_analysis is empty
  if (paramRows.length === 0) {
    const rawKeys = ["wbc", "rbc", "hemoglobin", "platelet", "neutrophils", "lymphocytes", "monocytes", "eosinophils"] as const;
    rawKeys.forEach((key) => {
      const val = (diagnosis as DiagnosisRecord & Record<string, unknown>)[key] as number | undefined;
      if (val === undefined || val === null) return;
      const range = normalRanges[key];
      if (!range) return;
      paramRows.push({
        label: range.label,
        value: String(val),
        low: String(range.min),
        high: String(range.max),
        unit: range.unit,
        status: val < range.min ? "Low" : val > range.max ? "High" : "Normal",
      });
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
              <FileText className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Medical Report</h1>
              <p className="text-sm text-muted-foreground">AI-generated clinical diagnosis report</p>
            </div>
          </div>
          <div className="flex gap-2">
            {generating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...
              </div>
            )}
            {!generating && reportUrl && (
              <a href={reportUrl!} target="_blank" rel="noopener noreferrer" className="btn-primary gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </a>
            )}
            <button onClick={() => window.print()} className="btn-secondary gap-2">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 animate-fade-in items-start">
        {/* History Sidebar */}
        <div className="medical-card p-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Past Reports</h3>
          </div>
          <div className="space-y-2 max-h-[800px] overflow-y-auto pr-1 custom-scrollbar">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setSearchParams({ id: item.id })}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  (diagnosisId === item.id || (!diagnosisId && diagnosis?.id === item.id)) 
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {item.input_type === "manual" ? "Manual Entry" : "Report OCR"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'detected' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                  }`}>
                    {item.status === 'detected' ? 'Positive' : 'Clear'}
                  </span>
                </div>
                <p className="font-medium text-sm text-foreground mb-1 truncate">
                  {item.cancer_type !== 'none' ? item.cancer_type.toUpperCase() : 'Routine Check'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No past reports.</p>
            )}
          </div>
        </div>

        {/* Report Document */}
        <div className="medical-card overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Microscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">HemaAI Clinical Report</h2>
                  <p className="text-white/70 text-sm">Blood Cancer Detection System — Diagnostic Report</p>
                </div>
              </div>
              <div className="text-right text-sm text-white/70">
                <p>Report ID: RPT-{diagnosis.id.slice(0, 8).toUpperCase()}</p>
                <p>Date: {reportDate}</p>
                <p>Status: {isDetected ? "Positive" : "Negative"}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Patient Information</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  ["Patient Name", user?.name || "—"],
                  ["Patient ID", `PAT-${(user?.id || "").slice(0, 8).toUpperCase()}`],
                  ["Email", user?.email || "—"],
                  ["Phone", user?.phone || "—"],
                  ["Age", user?.age ? String(user.age) : "—"],
                  ["Test Date", reportDate],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-muted-foreground text-xs">{k}</p>
                    <p className="font-medium text-foreground">{v}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Blood Parameters */}
            {paramRows.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Blood Parameter Values</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full data-table text-sm">
                    <thead>
                      <tr><th>Parameter</th><th>Patient Value</th><th>Normal Range</th><th>Unit</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {paramRows.map((row) => (
                        <tr key={row.label}>
                          <td className="font-medium">{row.label}</td>
                          <td className={`font-bold ${row.status !== "Normal" ? "text-danger" : "text-success"}`}>{row.value}</td>
                          <td className="text-muted-foreground">{row.low} – {row.high}</td>
                          <td className="text-muted-foreground">{row.unit}</td>
                          <td>
                            {row.status === "Normal"
                              ? <span className="badge-low">{row.status}</span>
                              : <span className="badge-high">{row.status}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* AI Result */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">AI Prediction Result</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Detection Status",
                    value: isDetected ? "DETECTED" : "CLEAR",
                    color: isDetected ? "text-danger" : "text-success",
                    bg: isDetected ? "bg-danger-light" : "bg-success-light",
                  },
                  { label: "Cancer Type", value: (diagnosis.cancer_type || "N/A").toUpperCase(), color: "text-primary", bg: "bg-primary-light" },
                  {
                    label: "Risk Level",
                    value: (diagnosis.risk_level || "low").toUpperCase(),
                    color: diagnosis.risk_level === "high" ? "text-danger" : diagnosis.risk_level === "medium" ? "text-warning" : "text-success",
                    bg: diagnosis.risk_level === "high" ? "bg-danger-light" : diagnosis.risk_level === "medium" ? "bg-warning-light" : "bg-success-light",
                  },
                  { label: "Confidence Score", value: `${diagnosis.confidence_score}%`, color: "text-primary", bg: "bg-primary-light" },
                ].map((r) => (
                  <div key={r.label} className={`${r.bg} rounded-xl p-4 text-center border border-border/50`}>
                    <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                    <p className={`text-xl font-bold font-display ${r.color}`}>{r.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Explanation */}
            {diagnosis.ai_explanation && diagnosis.ai_explanation.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Clinical Notes & Recommendations</h3>
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {isDetected ? "Urgent Clinical Action Required" : "Clinical Summary"}
                  </p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {diagnosis.ai_explanation.map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This report is generated by HemaAI. Results are intended for clinical decision support only and should be interpreted by a qualified hematologist or oncologist. Not a substitute for professional medical diagnosis.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>HemaAI Medical Systems · © {new Date().getFullYear()}</span>
              </div>
              <span>Diagnosis ID: {diagnosis.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalReports;
