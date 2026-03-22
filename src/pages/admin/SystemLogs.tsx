import { useState, useEffect } from "react";
import { FileSearch, AlertTriangle, Info, XCircle, Loader2 } from "lucide-react";
import { adminApi, type SystemLog } from "@/services/api";

const levelConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  INFO: { icon: Info, color: "text-primary", bg: "bg-primary-light" },
  WARN: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-light" },
  ERROR: { icon: XCircle, color: "text-danger", bg: "bg-danger-light" },
};

const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getLogs(1, 100)
      .then((res) => setLogs(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const levelCounts = {
    INFO: logs.filter((x) => x.level === "INFO").length,
    WARN: logs.filter((x) => x.level === "WARN").length,
    ERROR: logs.filter((x) => x.level === "ERROR").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"><FileSearch className="h-5 w-5 text-foreground" /></div>
        <div>
          <h1 className="text-2xl font-bold font-display">System Logs</h1>
          <p className="text-sm text-muted-foreground">Real-time activity and monitoring</p>
        </div>
      </div>
      <div className="flex gap-3">
        {(["INFO", "WARN", "ERROR"] as const).map((l) => {
          const cfg = levelConfig[l];
          return (
            <div key={l} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border ${cfg.bg}`}>
              <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
              <span className={`text-sm font-semibold ${cfg.color}`}>{l}</span>
              <span className={`text-lg font-bold font-display ${cfg.color}`}>{levelCounts[l]}</span>
            </div>
          );
        })}
      </div>
      <div className="medical-card overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-slow" />
          <span className="text-xs font-medium text-foreground">Live Feed</span>
        </div>
        <div className="divide-y divide-border/50 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">No logs yet</div>
          ) : (
            logs.map((log) => {
              const cfg = levelConfig[log.level] || levelConfig.INFO;
              return (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <span className="text-muted-foreground whitespace-nowrap flex-shrink-0">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>{log.level}</span>
                  <span className="text-primary flex-shrink-0">[{log.module}]</span>
                  <span className="text-foreground leading-relaxed">{log.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default SystemLogs;
