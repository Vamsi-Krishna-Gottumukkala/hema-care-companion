import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Upload, FlaskConical, Activity, FileText,
  MapPin, ClipboardList, LogOut, ChevronLeft, ChevronRight,
  Dna, Bell, User, Menu, X
} from "lucide-react";
import hemaLogo from "@/assets/hema-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Upload, label: "Upload Report", to: "/upload-report" },
  { icon: FlaskConical, label: "Enter Blood Values", to: "/enter-values" },
  { icon: Activity, label: "Diagnosis Result", to: "/diagnosis" },
  { icon: FileText, label: "Medical Reports", to: "/reports" },
  { icon: MapPin, label: "Find Hospitals", to: "/hospitals" },
  { icon: ClipboardList, label: "History", to: "/history" },
];

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-sidebar-border ${collapsed ? "justify-center" : ""}`}>
        <img src={hemaLogo} alt="HemaAI" className="h-8 w-8 rounded-lg bg-primary/20 p-0.5 flex-shrink-0" />
        {!collapsed && <span className="text-white font-bold font-display text-lg">HemaAI</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && <p className="text-sidebar-foreground/40 text-xs uppercase tracking-widest font-semibold px-2 mb-3">Patient Portal</p>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0 py-3" : ""}`
            }
          >
            <item.icon className={`h-4 w-4 flex-shrink-0 ${collapsed ? "h-5 w-5" : ""}`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={`flex items-center gap-3 p-2 rounded-lg ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.avatar}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm font-medium truncate">{user?.name}</p>
              <p className="text-sidebar-foreground/50 text-xs truncate">Patient</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`sidebar-nav-item w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 ${collapsed ? "justify-center px-0 py-3" : ""}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex-shrink-0 transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-sidebar transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-24 -right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-md z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground text-sm hidden sm:block">HemaAI — Blood Cancer Detection</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user?.avatar}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
