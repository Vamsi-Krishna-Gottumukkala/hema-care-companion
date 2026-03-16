import { useState } from "react";
import { UserCog, Plus, Edit, Trash2, Star, Activity } from "lucide-react";
import { mockDoctors } from "@/data/mockData";

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState(mockDoctors);
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
        <button className="btn-primary gap-2"><Plus className="h-4 w-4" /> Add Doctor</button>
      </div>
      <div className="medical-card overflow-hidden">
        <table className="w-full data-table">
          <thead><tr><th>Doctor</th><th>Specialization</th><th>Hospital</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{d.avatar}</div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.contact}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm">{d.specialization}</td>
                <td className="text-sm text-muted-foreground">{d.hospital}</td>
                <td className="text-sm">{d.experience}</td>
                <td><span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 text-warning fill-warning" />{d.rating}</span></td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${d.available ? "bg-success-light text-success" : "bg-muted text-muted-foreground"}`}>{d.available ? "Available" : "Unavailable"}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-muted"><Edit className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => setDoctors(doctors.filter((x) => x.id !== d.id))} className="p-1.5 rounded hover:bg-muted"><Trash2 className="h-4 w-4 text-danger" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DoctorManagement;
