import { useState, useEffect } from "react";
import { UserCog, Trash2, Star, Loader2 } from "lucide-react";
import { doctorsApi, adminApi, type Doctor } from "@/services/api";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorsApi.list()
      .then((res) => setDoctors(res.doctors))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deleteDoctor = async (id: string) => {
    try {
      await adminApi.deleteDoctor(id);
      setDoctors(doctors.filter((d) => d.id !== id));
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"><UserCog className="h-5 w-5 text-accent" /></div>
          <div>
            <h1 className="text-2xl font-bold font-display">Doctor Management</h1>
            <p className="text-sm text-muted-foreground">{doctors.length} specialist doctors</p>
          </div>
        </div>
      </div>
      {doctors.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          <UserCog className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          No doctors in database yet.
        </div>
      ) : (
        <div className="medical-card overflow-hidden">
          <table className="w-full data-table">
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Hospital</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {d.avatar || d.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.contact || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{d.specialization || "—"}</td>
                  <td className="text-sm text-muted-foreground">{d.hospital_name || "—"}</td>
                  <td className="text-sm">{d.experience || "—"}</td>
                  <td><span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 text-warning fill-warning" />{d.rating || "—"}</span></td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full ${d.available ? "bg-success-light text-success" : "bg-muted text-muted-foreground"}`}>{d.available ? "Available" : "Unavailable"}</span></td>
                  <td>
                    <button onClick={() => deleteDoctor(d.id)} className="p-1.5 rounded hover:bg-muted"><Trash2 className="h-4 w-4 text-danger" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default DoctorManagement;
