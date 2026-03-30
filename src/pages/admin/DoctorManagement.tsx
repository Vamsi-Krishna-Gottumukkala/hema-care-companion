import { useState, useEffect, useRef } from "react";
import { UserCog, Trash2, Star, Loader2, Plus, X, Building2 } from "lucide-react";
import { doctorsApi, hospitalsApi, adminApi, type Doctor, type Hospital } from "@/services/api";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [contact, setContact] = useState("");
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  useEffect(() => {
    doctorsApi.list()
      .then((res) => setDoctors(res.doctors))
      .catch(() => {})
      .finally(() => setLoading(false));

    hospitalsApi.list()
      .then((res) => setHospitals(res.hospitals))
      .catch(() => {});
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

  const handleAddDoctor = async () => {
    const hosp = hospitals.find(h => h.id === selectedHospitalId);
    if (!name || !hosp) return;
    setAdding(true);
    try {
      const newDoctor = await adminApi.createDoctor({
        name,
        specialization,
        experience,
        contact,
        hospital_id: hosp.id,
        hospital_name: hosp.name,
        available: true,
      });
      setDoctors([newDoctor, ...doctors]);
      setShowModal(false);
      
      // Cleanup
      setName("");
      setSpecialization("");
      setExperience("");
      setContact("");
      setSelectedHospitalId("");
    } catch {
      alert("Failed to add doctor.");
    }
    setAdding(false);
  };

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
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add Doctor
        </button>
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

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" /> Add Doctor
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Full Name</label>
                <input type="text" className="medical-input" placeholder="e.g. Dr. Emily Richards" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Specialization</label>
                  <input type="text" className="medical-input" placeholder="e.g. Oncology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Experience</label>
                  <input type="text" className="medical-input" placeholder="e.g. 15 years" value={experience} onChange={(e) => setExperience(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Contact Number</label>
                <input type="text" className="medical-input" placeholder="e.g. +1 (555) 123-4567" value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Hospital Assignment</label>
                <select 
                  className="medical-input bg-card appearance-none" 
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                >
                  <option value="">Select a registered hospital...</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name} {h.address ? `(${h.address.split(',')[0]})` : ''}</option>
                  ))}
                </select>
                {hospitals.length === 0 && (
                  <p className="text-xs text-danger mt-1">No hospitals exist in the database. Please add one first.</p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button 
                  onClick={handleAddDoctor} 
                  disabled={!selectedHospitalId || !name || adding} 
                  className="btn-primary flex-1 gap-2"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Doctor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DoctorManagement;
