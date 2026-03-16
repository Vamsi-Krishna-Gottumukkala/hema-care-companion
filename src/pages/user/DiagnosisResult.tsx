import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, CheckCircle, Activity, Brain, TrendingUp,
  FileText, Microscope, ChevronRight, Info, BarChart2, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

const bloodData = [
  { param: "WBC", value: 12.4, normal: 8.0, unit: "×10³/µL" },
  { param: "RBC", value: 3.8, normal: 5.0, unit: "×10⁶/µL" },
  { param: "HGB", value: 9.2, normal: 14.0, unit: "g/dL" },
  { param: "PLT", value: 98, normal: 275, unit: "×10³/µL" },
];

const radarData = [
  { subject: "WBC", value: 88, fullMark: 100 },
  { subject: "RBC", value: 40, fullMark: 100 },
  { subject: "HGB", value: 35, fullMark: 100 },
  { subject: "PLT", value: 25, fullMark: 100 },
  { subject: "NEU", value: 90, fullMark: 100 },
  { subject: "LYM", value: 38, fullMark: 100 },
];

const DiagnosisResult = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      let s = 0;
      const interval = setInterval(() => {
        s += 2;
        setAnimScore(s);
        if (s >= 87) clearInterval(interval);
      }, 20);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center">
            <Activity className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">AI Diagnosis Result</h1>
            <p className="text-sm text-muted-foreground">Analysis completed · March 15, 2024 · 14:23 UTC</p>
          </div>
        </div>
        <button onClick={() => navigate("/reports")} className="btn-primary gap-2">
          <FileText className="h-4 w-4" /> View Report
        </button>
      </div>

      {/* Main result cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Detection */}
        <div className="lg:col-span-1 bg-danger-light border-2 border-danger/30 rounded-xl p-5 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-danger/15 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detection Status</p>
            <p className="text-xl font-bold text-danger mt-1">DETECTED</p>
          </div>
        </div>

        {/* Cancer Type */}
        <div className="medical-card p-5 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center">
            <Microscope className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cancer Type</p>
            <p className="text-xl font-bold text-primary mt-1">ALL</p>
            <p className="text-xs text-muted-foreground">Acute Lymphoblastic Leukemia</p>
          </div>
        </div>

        {/* Risk */}
        <div className="bg-danger-light border border-danger/20 rounded-xl p-5 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-danger/15 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-danger" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Level</p>
            <p className="text-xl font-bold text-danger mt-1">HIGH</p>
            <span className="badge-high mt-1">Immediate Action</span>
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
            <p className="text-xl font-bold text-foreground mt-1">{animScore}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Blood Parameter Analysis
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bloodData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="param" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              />
              <Bar dataKey="normal" name="Normal Range" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="value" name="Patient Value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
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

      {/* AI Explanation */}
      <div className="medical-card p-5">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" /> AI Explanation & Clinical Notes
        </h3>
        <div className="space-y-3">
          {[
            { type: "critical", text: "WBC Count (12.4 ×10³/µL) is significantly elevated above normal range (4.5–11.0), indicating possible lymphocytic proliferation." },
            { type: "critical", text: "Hemoglobin (9.2 g/dL) is below normal threshold, consistent with anemia often seen in ALL patients." },
            { type: "critical", text: "Platelet Count (98 ×10³/µL) shows thrombocytopenia, a hallmark of acute leukemia." },
            { type: "info", text: "Neutrophil percentage (78%) is elevated suggesting immune stress response or infection accompaniment." },
            { type: "recommendation", text: "RECOMMENDATION: Immediate bone marrow biopsy and flow cytometry are strongly advised to confirm diagnosis and determine treatment protocol." },
          ].map((item, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${item.type === "critical" ? "bg-danger-light border-danger/20" : item.type === "recommendation" ? "bg-primary-light border-primary/20" : "bg-warning-light border-warning/20"}`}>
              {item.type === "critical" && <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />}
              {item.type === "info" && <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />}
              {item.type === "recommendation" && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
              <p className={`text-sm ${item.type === "critical" ? "text-danger" : item.type === "recommendation" ? "text-primary" : "text-warning"}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate("/reports")} className="btn-primary">
          <FileText className="h-4 w-4" /> View Full Report
        </button>
        <button onClick={() => navigate("/hospitals")} className="btn-outline-primary">
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
