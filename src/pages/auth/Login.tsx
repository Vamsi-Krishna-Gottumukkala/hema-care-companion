import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { Activity, Eye, EyeOff, Lock, Mail, Dna, ArrowLeft, CheckCircle2 } from "lucide-react";
import hemaLogo from "@/assets/hema-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNewPwd, setResetNewPwd] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (resetNewPwd.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    setResetLoading(true);
    try {
      await authApi.resetPassword(resetEmail, resetNewPwd);
      setResetLoading(false);
      setResetSuccess(true);
      setTimeout(() => {
        setShowReset(false);
        setResetSuccess(false);
        setResetEmail("");
        setResetNewPwd("");
      }, 3000);
    } catch (err: unknown) {
      setResetLoading(false);
      setResetError(err instanceof Error ? err.message : "Reset failed. Please check email.");
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

          {/* ─── Forgot Password View ─── */}
          {showReset ? (
            <div className="animate-fade-in">
              <button
                onClick={() => { setShowReset(false); setResetError(""); setResetSuccess(false); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold font-display text-foreground mb-2">Reset Password</h2>
                <p className="text-muted-foreground">Enter your email and set a new password</p>
              </div>

              {resetSuccess ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground mb-2">Password Reset!</h3>
                  <p className="text-muted-foreground text-sm">You can now sign in with your new password.</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="medical-input pl-10"
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={resetNewPwd}
                        onChange={(e) => setResetNewPwd(e.target.value)}
                        className="medical-input pl-10"
                        placeholder="Min. 6 characters"
                        required
                      />
                    </div>
                  </div>

                  {resetError && (
                    <div className="bg-danger-light border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm">
                      {resetError}
                    </div>
                  )}

                  <button type="submit" disabled={resetLoading} className="btn-primary w-full py-3 text-base">
                    {resetLoading ? (
                      <><Activity className="h-4 w-4 animate-spin" /> Resetting...</>
                    ) : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ─── Login View ─── */
            <>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-foreground">Password</label>
                    <button
                      type="button"
                      onClick={() => { setShowReset(true); setResetEmail(email); }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
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
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Admin Access</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">Email:</span> admin@hemaai.com</p>
                  <p><span className="font-medium text-foreground">Password:</span> admin123</p>
                </div>
              </div>
            </>
          )}

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
