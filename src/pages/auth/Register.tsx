import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, Dna, CheckCircle2 } from "lucide-react";
import hemaLogo from "@/assets/hema-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">Account Created!</h2>
          <p className="text-muted-foreground">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src={hemaLogo} alt="HemaAI" className="h-10 w-10 rounded-lg bg-white/20 p-1" />
            <span className="text-white text-2xl font-bold font-display">HemaAI</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Join the Future of<br />Medical Diagnostics
          </h1>
          <p className="text-white/80 text-lg">
            Create your account to access AI-powered blood cancer detection and connect with leading specialists.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {["Early detection saves lives", "AI-powered analysis in minutes", "Connect with 500+ specialist hospitals"].map((f) => (
            <div key={f} className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="h-5 w-5 text-white" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={hemaLogo} alt="HemaAI" className="h-10 w-10" />
            <span className="text-primary text-2xl font-bold font-display">HemaAI</span>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground">Join thousands of patients using HemaAI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="name" type="text" value={form.name} onChange={handleChange} className="medical-input pl-10" placeholder="Dr. John Smith" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className="medical-input pl-10" placeholder="email@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="medical-input pl-10" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handleChange} className="medical-input pl-10 pr-10" placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className="medical-input pl-10" placeholder="Re-enter password" required />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="mt-0.5 rounded border-border accent-primary" />
              <p className="text-xs text-muted-foreground">I agree to the <span className="text-primary cursor-pointer">Terms of Service</span> and <span className="text-primary cursor-pointer">Privacy Policy</span>. My health data will be encrypted and HIPAA-compliant.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Dna className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">HIPAA Compliant · ISO 27001 Certified</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
