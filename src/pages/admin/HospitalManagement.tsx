import { useState } from "react";
import { Building2, Plus, Edit, Trash2, MapPin, Star, Phone } from "lucide-react";
import { mockHospitals } from "@/data/mockData";

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState(mockHospitals);
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
        <button className="btn-primary gap-2"><Plus className="h-4 w-4" /> Add Hospital</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hospitals.map((h) => (
          <div key={h.id} className="medical-card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0"><Building2 className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{h.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{h.address}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs"><Star className="h-3 w-3 text-warning fill-warning" />{h.rating}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{h.phone}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">{h.specialization.map((s) => <span key={s} className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full">{s}</span>)}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button className="btn-secondary flex-1 text-xs py-1.5 gap-1.5"><Edit className="h-3.5 w-3.5" />Edit</button>
              <button onClick={() => setHospitals(hospitals.filter((x) => x.id !== h.id))} className="p-2 rounded-lg border border-border hover:bg-danger-light transition-colors"><Trash2 className="h-4 w-4 text-danger" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default HospitalManagement;
