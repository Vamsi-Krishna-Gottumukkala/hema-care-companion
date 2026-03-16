import { useNavigate } from "react-router-dom";
import {
  Users, Activity, TrendingUp, Brain, ChevronRight,
  AlertTriangle, CheckCircle, BarChart2, Shield
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { mockMonthlyData, mockCancerTypeData, mockAdminDiagnoses } from "@/data/mockData";

const StatCard = ({ icon: Icon, label, value, change, colorClass, bgClass }: {
  icon: React.ElementType; label: string; value: string; change: string;
  colorClass: string; bgClass: string;
}) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <span className="text-xs text-success font-medium">{change}</span>
    </div>
    <div className={`text-3xl font-bold font-display ${colorClass} mb-1`}>{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const accuracyData = [
  { month: "Sep", accuracy: 91.2 }, { month: "Oct", accuracy: 92.5 },
  { month: "Nov", accuracy: 93.1 }, { month: "Dec", accuracy: 93.8 },
  { month: "Jan", accuracy: 94.0 }, { month: "Feb", accuracy: 94.3 },
  { month: "Mar", accuracy: 94.6 },
];

const getRiskBadge = (risk: string) => {
  if (risk === "High") return <span className="badge-high">{risk}</span>;
  if (risk === "Medium") return <span className="badge-medium">{risk}</span>;
  return <span className="badge-low">{risk}</span>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-amber-300" />
              <p className="text-white/70 text-sm font-medium">Administration Console</p>
            </div>
            <h1 className="text-2xl font-bold font-display">HemaAI Analytics Dashboard</h1>
            <p className="text-white/70 text-sm mt-1">System overview · Updated just now</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => navigate("/admin/users")} className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Manage Users
            </button>
            <button onClick={() => navigate("/admin/diagnoses")} className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
              View Diagnoses
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value="2,847" change="+12.4%" colorClass="text-primary" bgClass="bg-primary-light" />
        <StatCard icon={Activity} label="Total Diagnoses" value="14,203" change="+8.1%" colorClass="text-accent" bgClass="bg-secondary" />
        <StatCard icon={AlertTriangle} label="Cancer Detected" value="3,842" change="+5.3%" colorClass="text-danger" bgClass="bg-danger-light" />
        <StatCard icon={Brain} label="Model Accuracy" value="94.6%" change="+0.3%" colorClass="text-success" bgClass="bg-success-light" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly diagnoses */}
        <div className="lg:col-span-2 medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Monthly Diagnoses
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="diagnoses" name="Total Tests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="detected" name="Detected" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cancer type pie */}
        <div className="medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Cancer Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mockCancerTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                {mockCancerTypeData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" /> Model Accuracy Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={accuracyData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[90, 96]} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))", r: 4 }} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent diagnoses */}
        <div className="medical-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Diagnoses</h3>
            <button onClick={() => navigate("/admin/diagnoses")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {mockAdminDiagnoses.slice(0, 4).map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${d.status === "Detected" ? "bg-danger-light text-danger" : "bg-success-light text-success"}`}>
                  {d.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{d.user}</p>
                  <p className="text-xs text-muted-foreground">{d.testDate}</p>
                </div>
                <div>
                  {d.status === "Detected"
                    ? <span className="badge-high text-xs">{d.cancerType}</span>
                    : <span className="badge-low text-xs">Clear</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "User Management", to: "/admin/users", icon: Users, color: "text-primary", bg: "bg-primary-light" },
          { label: "Diagnoses", to: "/admin/diagnoses", icon: Activity, color: "text-accent", bg: "bg-secondary" },
          { label: "Hospitals", to: "/admin/hospitals", icon: Shield, color: "text-success", bg: "bg-success-light" },
          { label: "System Logs", to: "/admin/logs", icon: BarChart2, color: "text-warning", bg: "bg-warning-light" },
        ].map((item) => (
          <button key={item.to} onClick={() => navigate(item.to)} className="medical-card p-4 flex flex-col items-center gap-3 hover:shadow-card transition-all group">
            <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
