import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star, Phone, ChevronLeft, GraduationCap,
  Users, Activity, Building2, CheckCircle, XCircle,
  Search, Filter, Loader2
} from "lucide-react";
import { hospitalsApi, doctorsApi, type Doctor, type Hospital } from "@/services/api";

const DoctorList = () => {
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const [search, setSearch] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (hospitalId) {
          const [hospRes, docRes] = await Promise.all([
            hospitalsApi.getById(hospitalId).catch(() => null),
            hospitalsApi.getDoctors(hospitalId),
          ]);
          if (hospRes) setHospital(hospRes);
          setDoctors(docRes.doctors);
        } else {
          const res = await doctorsApi.list();
          setDoctors(res.doctors);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [hospitalId]);

  const filtered = doctors
    .filter((d) => !filterAvailable || d.available)
    .filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <button onClick={() => navigate("/hospitals")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-3 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Hospitals
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display">{hospital ? `Doctors at ${hospital.name}` : "All Specialist Doctors"}</h1>
            <p className="text-sm text-muted-foreground mt-1">Hematology & Oncology Specialists</p>
          </div>
          {hospital && (
            <div className="hidden sm:flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2">
              <Building2 className="h-4 w-4 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-foreground">{hospital.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="medical-input pl-10" placeholder="Search by name or specialization..." />
        </div>
        <button
          onClick={() => setFilterAvailable(!filterAvailable)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${filterAvailable ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:bg-muted"}`}
        >
          <Filter className="h-4 w-4" /> Available Only
        </button>
      </div>

      <p className="text-sm text-muted-foreground">Showing <span className="font-medium text-foreground">{filtered.length}</span> specialist{filtered.length !== 1 ? "s" : ""}</p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No doctors found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc, idx) => (
            <div key={doc.id} className="medical-card p-5 hover:shadow-card transition-all duration-200 animate-fade-in flex flex-col" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold font-display flex-shrink-0">
                  {doc.avatar || doc.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{doc.name}</h3>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.available ? "bg-success" : "bg-muted-foreground"}`} />
                  </div>
                  <p className="text-xs text-primary mt-0.5">{doc.specialization || "Hematologist"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <span className="text-xs font-semibold text-foreground">{doc.rating || "—"}</span>
                    <span className="text-xs text-muted-foreground">({(doc.patients || 0).toLocaleString()} patients)</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${doc.available ? "bg-success-light text-success" : "bg-muted text-muted-foreground"}`}>
                  {doc.available ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                {doc.education && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{doc.education}</span>
                  </div>
                )}
                {doc.experience && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{doc.experience} experience</span>
                  </div>
                )}
                {doc.hospital_name && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{doc.hospital_name}</span>
                  </div>
                )}
                {doc.contact && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{doc.contact}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <button className="btn-primary flex-1 text-xs py-2">
                  {doc.available ? <><CheckCircle className="h-3.5 w-3.5" /> Book Appointment</> : <><XCircle className="h-3.5 w-3.5" /> Unavailable</>}
                </button>
                {doc.contact && (
                  <button className="btn-secondary text-xs py-2 px-3">
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;
