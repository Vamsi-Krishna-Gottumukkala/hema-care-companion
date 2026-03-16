import { useState } from "react";
import { Users, Search, MoreVertical, UserCheck, UserX, Trash2, Filter } from "lucide-react";
import { mockUsers } from "@/data/mockData";

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = users
    .filter((u) => filter === "all" || u.status.toLowerCase() === filter)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Disabled" : "Active" } : u));
  };

  const deleteUser = (id: string) => setUsers(users.filter((u) => u.id !== id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered patients</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="medical-input pl-10" placeholder="Search users..." />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
          {[{ v: "all", l: "All" }, { v: "active", l: "Active" }, { v: "disabled", l: "Disabled" }].map((opt) => (
            <button key={opt.v} onClick={() => setFilter(opt.v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === opt.v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="medical-card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Registered</th>
              <th>Tests</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground text-sm">{u.registrationDate}</td>
                <td><span className="font-semibold text-foreground">{u.testsCount}</span></td>
                <td className="text-muted-foreground text-sm">{u.lastActive}</td>
                <td>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-success-light text-success" : "bg-muted text-muted-foreground"}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStatus(u.id)} title={u.status === "Active" ? "Disable" : "Enable"}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      {u.status === "Active" ? <UserX className="h-4 w-4 text-warning" /> : <UserCheck className="h-4 w-4 text-success" />}
                    </button>
                    <button onClick={() => deleteUser(u.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Trash2 className="h-4 w-4 text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-muted-foreground text-sm">No users found</div>
        )}
      </div>
    </div>
  );
};
export default UserManagement;
