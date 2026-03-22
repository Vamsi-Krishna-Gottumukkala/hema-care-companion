import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Activity, TrendingUp, Brain, ChevronRight,
  AlertTriangle, CheckCircle, BarChart2, Shield, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { adminApi, type AdminStats } from "@/services/api";

const COLORS = ["#2563eb", "#dc2626", "#f59e0b", "#16a34a", "#8b5cf6"];

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass }: {
  icon: React.ElementType; label: string; value: string;
  colorClass: string; bgClass: string;
}) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
    </div>
    <div className={`text-3xl font-bold font-display ${colorClass} mb-1`}>{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthlyData = stats?.monthly_data || [];
  const cancerTypeData = (stats?.cancer_type_data || []).map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }));

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
        <StatCard icon={Users} label="Total Users" value={String(stats?.total_users || 0)} colorClass="text-primary" bgClass="bg-primary-light" />
        <StatCard icon={Activity} label="Total Diagnoses" value={String(stats?.total_diagnoses || 0)} colorClass="text-accent" bgClass="bg-secondary" />
        <StatCard icon={AlertTriangle} label="Cancer Detected" value={String(stats?.cancer_detected || 0)} colorClass="text-danger" bgClass="bg-danger-light" />
        <StatCard icon={Brain} label="Model Accuracy" value={`${stats?.model_accuracy || 0}%`} colorClass="text-success" bgClass="bg-success-light" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly diagnoses */}
        <div className="lg:col-span-2 medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Monthly Diagnoses
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="diagnoses" name="Total Tests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="detected" name="Detected" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        {/* Cancer type pie */}
        <div className="medical-card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Cancer Type Distribution
          </h3>
          {cancerTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={cancerTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80}>
                  {cancerTypeData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
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
