import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, MapPin, Star, Phone, Loader2 } from "lucide-react";
import { hospitalsApi, adminApi, type Hospital } from "@/services/api";

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hospitalsApi.list()
      .then((res) => setHospitals(res.hospitals))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deleteHospital = async (id: string) => {
    try {
      await adminApi.deleteHospital(id);
      setHospitals(hospitals.filter((h) => h.id !== id));
    } catch { /* ignore */ }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center"><Building2 className="h-5 w-5 text-success" /></div>
          <div>
            <h1 className="text-2xl font-bold font-display">Hospital Management</h1>
            <p className="text-sm text-muted-foreground">{hospitals.length} hospitals in database</p>
          </div>
        </div>
      </div>
      {hospitals.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          <Building2 className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          No hospitals in database yet. Use the Hospital Finder to search nearby hospitals.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((h) => (
            <div key={h.id} className="medical-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{h.name}</h3>
                  {h.address && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{h.address}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    {h.rating && <span className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 text-warning fill-warning" />{h.rating}</span>}
                    {h.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{h.phone}</span>}
                  </div>
                  {h.specializations && h.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.specializations.map((s) => <span key={s} className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => deleteHospital(h.id!)} className="p-2 rounded-lg border border-border hover:bg-danger-light transition-colors">
                  <Trash2 className="h-4 w-4 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default HospitalManagement;
