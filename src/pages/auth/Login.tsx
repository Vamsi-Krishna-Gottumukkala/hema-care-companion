import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Activity, Eye, EyeOff, Lock, Mail, Dna } from "lucide-react";
import hemaLogo from "@/assets/hema-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { success, role } = await login(email, password);
    setLoading(false);
    if (success) {
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src={hemaLogo} alt="HemaAI" className="h-10 w-10 rounded-lg bg-white/20 p-1" />
            <span className="text-white text-2xl font-bold font-display">HemaAI</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Advanced Blood Cancer<br />Detection System
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Powered by cutting-edge AI to deliver precise blood cancer detection with 94%+ accuracy. Trusted by leading hospitals worldwide.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[{ label: "Accuracy", value: "94.6%" }, { label: "Hospitals", value: "500+" }, { label: "Tests Done", value: "50K+" }].map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold font-display">{s.value}</div>
              <div className="text-white/70 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <img src={hemaLogo} alt="HemaAI" className="h-10 w-10" />
            <span className="text-primary text-2xl font-bold font-display">HemaAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="medical-input pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="medical-input pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger-light border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <><Activity className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">Create account</Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">User:</span> user@email.com / any password</p>
              <p><span className="font-medium text-foreground">Admin:</span> admin@hemaai.com / any password</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Dna className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              HIPAA Compliant · ISO 27001 Certified · FDA Cleared
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
