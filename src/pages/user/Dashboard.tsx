import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FlaskConical, Stethoscope, TrendingUp, Building2,
  Upload, Activity, MapPin, ChevronRight, CheckCircle,
  AlertTriangle, XCircle, BarChart2, Clock, FileText
} from "lucide-react";
import { mockDiagnosisHistory } from "@/data/mockData";

const StatCard = ({
  icon: Icon, label, value, sublabel, colorClass, bgClass
}: {
  icon: React.ElementType; label: string; value: string; sublabel: string;
  colorClass: string; bgClass: string;
}) => (
  <div className="stat-card group cursor-default">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <BarChart2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className={`text-3xl font-bold font-display ${colorClass} mb-1`}>{value}</div>
    <div className="text-sm font-medium text-foreground">{label}</div>
    <div className="text-xs text-muted-foreground mt-0.5">{sublabel}</div>
  </div>
);

const QuickAction = ({
  icon: Icon, label, description, to, color
}: {
  icon: React.ElementType; label: string; description: string; to: string; color: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 text-left w-full group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </button>
  );
};

const getRiskBadge = (risk: string) => {
  if (risk === "High") return <span className="badge-high">{risk}</span>;
  if (risk === "Medium") return <span className="badge-medium">{risk}</span>;
  return <span className="badge-low">{risk}</span>;
};

const getStatusIcon = (status: string) => {
  if (status === "Detected") return <XCircle className="h-4 w-4 text-danger" />;
  return <CheckCircle className="h-4 w-4 text-success" />;
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const recent = mockDiagnosisHistory.slice(0, 3);
  const lastResult = mockDiagnosisHistory[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold font-display mb-1">{user?.name}</h1>
          <p className="text-white/70 text-sm">Your health dashboard is ready. Last check: {lastResult.date}</p>
        </div>
        <div className="relative z-10 flex items-center gap-2 mt-4">
          <button
            onClick={() => navigate("/upload-report")}
            className="bg-white text-primary font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Run New Test
          </button>
          <button
            onClick={() => navigate("/diagnosis")}
            className="bg-white/15 text-white font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Activity className="h-4 w-4" /> View Last Result
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FlaskConical} label="Total Tests" value="5" sublabel="All time" colorClass="text-primary" bgClass="bg-primary-light" />
        <StatCard icon={Activity} label="Last Result" value={lastResult.status === "Detected" ? "⚠ Positive" : "✓ Clear"} sublabel={lastResult.date} colorClass={lastResult.status === "Detected" ? "text-danger" : "text-success"} bgClass={lastResult.status === "Detected" ? "bg-danger-light" : "bg-success-light"} />
        <StatCard icon={TrendingUp} label="Risk Level" value={lastResult.riskLevel} sublabel={`${lastResult.confidenceScore}% confidence`} colorClass={lastResult.riskLevel === "High" ? "text-danger" : lastResult.riskLevel === "Medium" ? "text-warning" : "text-success"} bgClass={lastResult.riskLevel === "High" ? "bg-danger-light" : lastResult.riskLevel === "Medium" ? "bg-warning-light" : "bg-success-light"} />
        <StatCard icon={Building2} label="Nearby Hospitals" value="4" sublabel="Within 5 km" colorClass="text-accent" bgClass="bg-secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="section-title">Quick Actions</h2>
          <QuickAction icon={Upload} label="Upload Blood Report" description="PDF or image, OCR extraction" to="/upload-report" color="bg-primary" />
          <QuickAction icon={FlaskConical} label="Enter Blood Values" description="Manual parameter entry" to="/enter-values" color="bg-accent" />
          <QuickAction icon={MapPin} label="Find Hospitals" description="GPS-based hospital search" to="/hospitals" color="bg-success" />
          <QuickAction icon={FileText} label="Medical Reports" description="View & download reports" to="/reports" color="bg-warning" />
          <QuickAction icon={Clock} label="Diagnosis History" description="Past test results" to="/history" color="bg-purple-500" />
        </div>

        {/* Recent History */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Diagnoses</h2>
            <button onClick={() => navigate("/history")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="medical-card overflow-hidden">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Cancer Type</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((d) => (
                  <tr key={d.id} className="cursor-pointer" onClick={() => navigate("/diagnosis")}>
                    <td className="text-muted-foreground">{d.date}</td>
                    <td>{d.inputType}</td>
                    <td className="font-medium">{d.cancerType}</td>
                    <td>{getRiskBadge(d.riskLevel)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(d.status)}
                        <span className={`text-xs font-medium ${d.status === "Detected" ? "text-danger" : "text-success"}`}>
                          {d.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Alert */}
          {lastResult.status === "Detected" && (
            <div className="mt-4 bg-danger-light border border-danger/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">Cancer Detected — Immediate Action Required</p>
                <p className="text-xs text-muted-foreground mt-1">Your last test detected {lastResult.cancerType} with {lastResult.confidenceScore}% confidence. Please consult a hematologist immediately.</p>
                <button onClick={() => navigate("/hospitals")} className="mt-2 text-xs font-medium text-danger underline">
                  Find Specialists Near You →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Stethoscope, title: "Regular Monitoring", desc: "Run blood tests every 3 months for early detection." },
          { icon: Activity, title: "Track Progress", desc: "Monitor your blood parameters over time with our charts." },
          { icon: Building2, title: "Expert Care", desc: "Connect with 500+ hematology specialists in your area." },
        ].map((tip) => (
          <div key={tip.title} className="p-4 rounded-xl bg-primary-light border border-primary/10 flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <tip.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
