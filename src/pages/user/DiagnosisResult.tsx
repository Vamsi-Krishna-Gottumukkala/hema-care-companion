import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, Activity, Brain, TrendingUp,
  FileText, Microscope, ChevronRight, Info, BarChart2, Loader2, XCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { diagnosisApi, reportsApi, type DiagnosisRecord } from "@/services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const fullReportUrl = (url: string) => {
  const token = localStorage.getItem("token");
  const base = url.startsWith("/") ? `${API_BASE}${url}` : url;
  return token ? `${base}?token=${token}` : base;
};

const DiagnosisResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosisId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [error, setError] = useState("");
  const [animScore, setAnimScore] = useState(0);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!diagnosisId) {
      // No ID — try to load latest from history
      diagnosisApi.getHistory(1, 1).then((res) => {
        if (res.items.length > 0) {
          navigate(`/diagnosis?id=${res.items[0].id}`, { replace: true });
        } else {
          setError("No diagnosis found. Please run a test first.");
          setLoading(false);
        }
      }).catch(() => {
        setError("Failed to load diagnosis.");
        setLoading(false);
      });
      return;
    }

    diagnosisApi.getDetail(diagnosisId)
      .then((data) => {
        setDiagnosis(data);
        setLoading(false);

        // Animate confidence score
        const targetScore = data.confidence_score || 0;
        let s = 0;
        const interval = setInterval(() => {
          s += 2;
          setAnimScore(Math.min(s, targetScore));
          if (s >= targetScore) clearInterval(interval);
        }, 20);

        // Auto-generate report in background
        setReportGenerating(true);
        reportsApi.generate(data.id)
          .then((r) => {
            setReportUrl(r.report_url ? fullReportUrl(r.report_url) : null);
          })
          .catch(() => {})
          .finally(() => setReportGenerating(false));
      })
      .catch(() => {
        setError("Failed to load diagnosis result.");
        setLoading(false);
      });
  }, [diagnosisId, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
          <Brain className="h-12 w-12 text-primary animate-pulse-slow" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold font-display mb-2">AI Analysis in Progress</h2>
          <p className="text-muted-foreground text-sm">Processing blood parameters through neural network...</p>
        </div>
        <div className="w-64 space-y-2">
          {["Loading ML model", "Analyzing CBC parameters", "Cross-referencing database", "Generating prediction"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
              <span className="text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <XCircle className="h-12 w-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Result Found</h2>
        <p className="text-muted-foreground text-sm mb-6">{error || "Please run a diagnosis first."}</p>
        <button onClick={() => navigate("/enter-values")} className="btn-primary">Run New Diagnosis</button>
      </div>
    );
  }

  const isDetected = diagnosis.status === "detected";
  const riskLevel = diagnosis.risk_level || "low";
  const params: { param: string; value: number; normal: number; unit: string }[] = (diagnosis.parameter_analysis || []).map((p) => ({
    param: p.param.toUpperCase().slice(0, 4),
    value: p.value,
    normal: (p.normal_min + p.normal_max) / 2,
    unit: p.unit,
  }));

  const radarData = (diagnosis.parameter_analysis || []).slice(0, 6).map((p) => ({
    subject: p.param.toUpperCase().slice(0, 3),
    value: p.flagged ? Math.min(90, (p.value / p.normal_max) * 80) : Math.min(60, (p.value / p.normal_max) * 60),
    fullMark: 100,
  }));

  const getRiskColor = (r: string) => {
    if (r === "high") return "text-danger";
    if (r === "medium") return "text-warning";
    return "text-success";
  };
  const getRiskBg = (r: string) => {
    if (r === "high") return "bg-danger-light border-danger/20";
    if (r === "medium") return "bg-warning-light border-warning/20";
    return "bg-success-light border-success/20";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDetected ? "bg-danger-light" : "bg-success-light"}`}>
            <Activity className={`h-5 w-5 ${isDetected ? "text-danger" : "text-success"}`} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">AI Diagnosis Result</h1>
            <p className="text-sm text-muted-foreground">
              Analysis completed · {diagnosis.created_at ? new Date(diagnosis.created_at).toLocaleString("en-GB") : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/reports?id=${diagnosis.id}`)}
          className="btn-primary gap-2"
          disabled={reportGenerating}
        >
          {reportGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          {reportGenerating ? "Generating..." : "View Report"}
        </button>
      </div>

      {/* Main result cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Detection */}
        <div className={`rounded-xl p-5 flex flex-col items-center text-center gap-3 border-2 ${isDetected ? "bg-danger-light border-danger/30" : "bg-success-light border-success/30"}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDetected ? "bg-danger/15" : "bg-success/15"}`}>
            {isDetected
              ? <AlertTriangle className="h-7 w-7 text-danger" />
              : <CheckCircle className="h-7 w-7 text-success" />}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detection Status</p>
            <p className={`text-xl font-bold mt-1 ${isDetected ? "text-danger" : "text-success"}`}>
              {isDetected ? "DETECTED" : "CLEAR"}
            </p>
          </div>
        </div>

        {/* Cancer Type */}
        <div className="medical-card p-5 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
            <Microscope className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancer Type</p>
            <p className="text-xl font-bold text-primary mt-1">{diagnosis.cancer_type?.toUpperCase() || "N/A"}</p>
          </div>
        </div>

        {/* Risk */}
        <div className={`rounded-xl p-5 flex flex-col items-center text-center gap-3 border ${getRiskBg(riskLevel)}`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getRiskBg(riskLevel)}`}>
            <TrendingUp className={`h-7 w-7 ${getRiskColor(riskLevel)}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Level</p>
            <p className={`text-xl font-bold mt-1 ${getRiskColor(riskLevel)}`}>{riskLevel.toUpperCase()}</p>
            {riskLevel === "high" && <span className="badge-high mt-1">Immediate Action</span>}
            {riskLevel === "medium" && <span className="badge-medium mt-1">Monitor Closely</span>}
            {riskLevel === "low" && <span className="badge-low mt-1">Routine Check</span>}
          </div>
        </div>

        {/* Confidence */}
        <div className="medical-card p-5 flex flex-col items-center text-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                strokeDasharray={`${(animScore / 100) * 138.2} 138.2`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{animScore}%</span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Confidence</p>
            <p className="text-xl font-bold text-foreground mt-1">{diagnosis.confidence_score}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {params.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medical-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Blood Parameter Analysis
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={params} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="param" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Bar dataKey="normal" name="Normal (avg)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value" name="Patient Value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="medical-card p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> AI Risk Mapping
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Risk Score" dataKey="value" stroke="hsl(var(--danger))" fill="hsl(var(--danger))" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Explanation */}
      {diagnosis.ai_explanation && diagnosis.ai_explanation.length > 0 && (
        <div className="medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> AI Explanation & Clinical Notes
          </h3>
          <div className="space-y-3">
            {diagnosis.ai_explanation.map((text, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === diagnosis.ai_explanation.length - 1;
              const type = isLast ? "recommendation" : isFirst || (diagnosis.parameter_analysis?.[idx]?.flagged) ? "critical" : "info";
              return (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${type === "critical" ? "bg-danger-light border-danger/20" : type === "recommendation" ? "bg-primary-light border-primary/20" : "bg-warning-light border-warning/20"}`}>
                  {type === "critical" && <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />}
                  {type === "info" && <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />}
                  {type === "recommendation" && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                  <p className={`text-sm ${type === "critical" ? "text-danger" : type === "recommendation" ? "text-primary" : "text-warning"}`}>{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Parameter details table */}
      {params.length > 0 && (
        <div className="medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Detailed Parameter Analysis
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full data-table text-sm">
              <thead><tr><th>Parameter</th><th>Value</th><th>Normal Range</th><th>Unit</th><th>Status</th></tr></thead>
              <tbody>
                {(diagnosis.parameter_analysis || []).map((p) => (
                  <tr key={p.param}>
                    <td className="font-medium">{p.param}</td>
                    <td className={`font-bold ${p.flagged ? "text-danger" : "text-success"}`}>{p.value}</td>
                    <td className="text-muted-foreground">{p.normal_min} – {p.normal_max}</td>
                    <td className="text-muted-foreground">{p.unit}</td>
                    <td>
                      {p.flagged
                        ? <span className="badge-high">Abnormal</span>
                        : <span className="badge-low">Normal</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/reports?id=${diagnosis.id}`)}
          className="btn-primary"
          disabled={reportGenerating}
        >
          <FileText className="h-4 w-4" />
          {reportGenerating ? "Generating Report..." : "View Full Report"}
        </button>
        <button onClick={() => navigate("/hospitals")} className="btn-secondary">
          <Activity className="h-4 w-4" /> Find Specialists
        </button>
        <button onClick={() => navigate("/history")} className="btn-secondary">
          View History <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DiagnosisResult;
