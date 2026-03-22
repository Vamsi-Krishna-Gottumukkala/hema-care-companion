import { useState, useEffect } from "react";
import { Activity, Search, Eye, Loader2 } from "lucide-react";
import { adminApi, type DiagnosisRecord } from "@/services/api";

const getRisk = (risk: string) => {
  if (risk === "high") return <span className="badge-high">High</span>;
  if (risk === "medium") return <span className="badge-medium">Medium</span>;
  return <span className="badge-low">Low</span>;
};

const DiagnosisMonitoring = () => {
  const [diagnoses, setDiagnoses] = useState<(DiagnosisRecord & { user_name?: string; user_email?: string })[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listDiagnoses(1, 100)
      .then((res) => setDiagnoses(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = diagnoses.filter(
    (d) =>
      (d.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.cancer_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Activity className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display">Diagnosis Monitoring</h1>
          <p className="text-sm text-muted-foreground">All AI prediction results across users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="medical-input pl-10" placeholder="Search user or cancer type..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="medical-card overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Test Date</th>
                <th>Cancer Type</th>
                <th>Risk Level</th>
                <th>Confidence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div>
                      <p className="font-medium text-sm text-foreground">{d.user_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{d.user_email || ""}</p>
                    </div>
                  </td>
                  <td className="text-muted-foreground text-sm">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}</td>
                  <td className="font-semibold">{d.cancer_type || "—"}</td>
                  <td>{getRisk(d.risk_level || "low")}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${d.confidence_score || 0}%` }} />
                      </div>
                      <span className="text-xs font-medium">{d.confidence_score || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.status === "detected" ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                      {d.status === "detected" ? "Detected" : "Clear"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-sm">No diagnoses found</div>
          )}
        </div>
      )}
    </div>
  );
};
export default DiagnosisMonitoring;
