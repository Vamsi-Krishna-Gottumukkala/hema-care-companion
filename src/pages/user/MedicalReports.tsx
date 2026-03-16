import { useState } from "react";
import {
  FileText, Download, Printer, User, Activity, AlertTriangle,
  CheckCircle, Microscope, Building2, Brain, Shield
} from "lucide-react";

const MedicalReports = () => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          {!generated && (
            <button onClick={generate} disabled={generating} className="btn-primary">
              {generating ? "Generating..." : "Generate Report"}
            </button>
          )}
        </div>
      </div>

      {!generated && !generating && (
        <div className="medical-card p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Report Generated</h3>
          <p className="text-sm text-muted-foreground mb-6">Generate a professional medical report from your latest AI diagnosis result.</p>
          <button onClick={generate} className="btn-primary mx-auto">Generate Report</button>
        </div>
      )}

      {generating && (
        <div className="medical-card p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">Generating Report...</p>
          <p className="text-sm text-muted-foreground mt-1">Compiling diagnosis data and clinical notes</p>
        </div>
      )}

      {generated && (
        <div className="animate-fade-in space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button className="btn-secondary gap-2">
              <Printer className="h-4 w-4" /> Print Report
            </button>
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
                  <p>Report ID: RPT-2024-0315</p>
                  <p>Date: March 15, 2024</p>
                  <p>Version: 3.2.1</p>
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
                    ["Patient Name", "Sarah Johnson"],
                    ["Date of Birth", "March 12, 1990"],
                    ["Patient ID", "PAT-2024-001"],
                    ["Gender", "Female"],
                    ["Phone", "+1 (555) 234-5678"],
                    ["Email", "sarah.j@email.com"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-muted-foreground text-xs">{k}</p>
                      <p className="font-medium text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Blood Parameters */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Blood Parameter Values</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full data-table text-sm">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Patient Value</th>
                        <th>Normal Range</th>
                        <th>Unit</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { p: "WBC Count", val: "12.4", low: "4.5", high: "11.0", unit: "×10³/µL", status: "High" },
                        { p: "RBC Count", val: "3.8", low: "4.2", high: "5.9", unit: "×10⁶/µL", status: "Low" },
                        { p: "Hemoglobin", val: "9.2", low: "12.0", high: "17.5", unit: "g/dL", status: "Low" },
                        { p: "Platelet Count", val: "98", low: "150", high: "400", unit: "×10³/µL", status: "Low" },
                        { p: "Neutrophils", val: "78", low: "40", high: "70", unit: "%", status: "High" },
                        { p: "Lymphocytes", val: "15", low: "20", high: "40", unit: "%", status: "Low" },
                        { p: "Monocytes", val: "5", low: "2", high: "8", unit: "%", status: "Normal" },
                        { p: "Eosinophils", val: "2", low: "1", high: "4", unit: "%", status: "Normal" },
                      ].map((row) => (
                        <tr key={row.p}>
                          <td className="font-medium">{row.p}</td>
                          <td className={`font-bold ${row.status !== "Normal" ? "text-danger" : "text-success"}`}>{row.val}</td>
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

              {/* AI Result */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <Brain className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Prediction Result</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Detection Status", value: "DETECTED", color: "text-danger", bg: "bg-danger-light" },
                    { label: "Cancer Type", value: "ALL", color: "text-primary", bg: "bg-primary-light" },
                    { label: "Risk Level", value: "HIGH", color: "text-danger", bg: "bg-danger-light" },
                    { label: "Confidence Score", value: "87.4%", color: "text-primary", bg: "bg-primary-light" },
                  ].map((r) => (
                    <div key={r.label} className={`${r.bg} rounded-xl p-4 text-center border border-border/50`}>
                      <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                      <p className={`text-xl font-bold font-display ${r.color}`}>{r.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recommendation */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Medical Recommendation</h3>
                </div>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Urgent Clinical Action Required
                  </p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {[
                      "Immediate referral to Hematology / Oncology specialist",
                      "Bone marrow biopsy and flow cytometry for confirmation",
                      "Complete immunophenotyping of blast cells",
                      "Lumbar puncture to assess CNS involvement",
                      "Begin staging workup per NCCN guidelines",
                    ].map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Disclaimer */}
              <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-start gap-3">
                <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This report is generated by HemaAI v3.2.1 (FDA Class II cleared). Results are intended for clinical decision support only and should be interpreted by a qualified hematologist or oncologist. Not a substitute for professional medical diagnosis.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>HemaAI Medical Systems · © 2024</span>
                </div>
                <span>HIPAA Compliant · ISO 27001 Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalReports;
