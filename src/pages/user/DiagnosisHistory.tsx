import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Download, Eye, Search,
  CheckCircle, XCircle, Clock, Loader2
} from "lucide-react";
import { diagnosisApi, type DiagnosisRecord } from "@/services/api";

const getRiskBadge = (risk: string) => {
  if (risk === "high") return <span className="badge-high">High</span>;
  if (risk === "medium") return <span className="badge-medium">Medium</span>;
  return <span className="badge-low">Low</span>;
};

const DiagnosisHistory = () => {
  const navigate = useNavigate();
  const [allDiagnoses, setAllDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diagnosisApi.getHistory(1, 100)
      .then((res) => setAllDiagnoses(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = allDiagnoses
    .filter((d) => filter === "all" || d.status === filter)
    .filter((d) =>
      (d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB") : "").includes(search) ||
      (d.cancer_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.input_type || "").toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total: allDiagnoses.length,
    detected: allDiagnoses.filter((d) => d.status === "detected").length,
    notDetected: allDiagnoses.filter((d) => d.status === "not_detected").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Diagnosis History</h1>
            <p className="text-sm text-muted-foreground">All your blood cancer screening results</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tests", value: stats.total, icon: ClipboardList, color: "text-primary", bg: "bg-primary-light" },
          { label: "Cancer Detected", value: stats.detected, icon: XCircle, color: "text-danger", bg: "bg-danger-light" },
          { label: "Clear Results", value: stats.notDetected, icon: CheckCircle, color: "text-success", bg: "bg-success-light" },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="medical-input pl-10" placeholder="Search by date, type, cancer..." />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
          {[{ v: "all", l: "All" }, { v: "detected", l: "Detected" }, { v: "not_detected", l: "Clear" }].map((opt) => (
            <button key={opt.v} onClick={() => setFilter(opt.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === opt.v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="medical-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Input Type</th>
                  <th>Cancer Type</th>
                  <th>Risk Level</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB") : "—"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full">{d.input_type}</span>
                    </td>
                    <td className="font-semibold text-foreground">{d.cancer_type || "—"}</td>
                    <td>{getRiskBadge(d.risk_level || "low")}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.confidence_score || 0}%` }} />
                        </div>
                        <span className="text-xs font-medium">{d.confidence_score || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {d.status === "detected"
                          ? <><XCircle className="h-4 w-4 text-danger" /><span className="text-xs font-medium text-danger">Detected</span></>
                          : <><CheckCircle className="h-4 w-4 text-success" /><span className="text-xs font-medium text-success">Clear</span></>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/diagnosis?id=${d.id}`)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="View Result">
                          <Eye className="h-4 w-4 text-primary" />
                        </button>
                        <button onClick={() => navigate("/reports")} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Download Report">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiagnosisHistory;
