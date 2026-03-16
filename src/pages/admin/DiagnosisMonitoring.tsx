import { useState } from "react";
import { Activity, Search, Eye } from "lucide-react";
import { mockAdminDiagnoses } from "@/data/mockData";

const getRisk = (risk: string) => {
  if (risk === "High") return <span className="badge-high">{risk}</span>;
  if (risk === "Medium") return <span className="badge-medium">{risk}</span>;
  return <span className="badge-low">{risk}</span>;
};

const DiagnosisMonitoring = () => {
  const [search, setSearch] = useState("");
  const filtered = mockAdminDiagnoses.filter(
    (d) => d.user.toLowerCase().includes(search.toLowerCase()) || d.cancerType.toLowerCase().includes(search.toLowerCase())
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>
                  <div>
                    <p className="font-medium text-sm text-foreground">{d.user}</p>
                    <p className="text-xs text-muted-foreground">{d.email}</p>
                  </div>
                </td>
                <td className="text-muted-foreground text-sm">{d.testDate}</td>
                <td className="font-semibold">{d.cancerType}</td>
                <td>{getRisk(d.riskLevel)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${d.confidence}%` }} />
                    </div>
                    <span className="text-xs font-medium">{d.confidence}%</span>
                  </div>
                </td>
                <td>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.status === "Detected" ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                    {d.status}
                  </span>
                </td>
                <td>
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                    <Eye className="h-4 w-4 text-primary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DiagnosisMonitoring;
