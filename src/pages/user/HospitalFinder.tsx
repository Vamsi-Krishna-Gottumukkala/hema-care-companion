import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Navigation, Star, Phone, ChevronRight, Building2,
  Loader2, Search, Filter, RefreshCw, Clock, Users
} from "lucide-react";
import { mockHospitals } from "@/data/mockData";

const HospitalFinder = () => {
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  const requestLocation = () => {
    setLocating(true);
    setTimeout(() => { setLocating(false); setLocated(true); }, 1800);
  };

  const filtered = mockHospitals
    .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : parseFloat(a.distance) - parseFloat(b.distance));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
            <MapPin className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">GPS Hospital Finder</h1>
            <p className="text-sm text-muted-foreground">Find nearby hematology & oncology specialists</p>
          </div>
        </div>
      </div>

      {/* GPS Banner */}
      {!located ? (
        <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Navigation className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold font-display mb-1">Enable GPS Location</h2>
              <p className="text-white/80 text-sm">Allow HemaAI to access your location to find the nearest blood cancer specialists and hospitals.</p>
            </div>
            <button
              onClick={requestLocation}
              disabled={locating}
              className="bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {locating ? <><Loader2 className="h-4 w-4 animate-spin" /> Locating...</> : <><MapPin className="h-4 w-4" /> Find Nearby</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-success-light border border-success/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
            <Navigation className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-success">Location Detected</p>
            <p className="text-xs text-muted-foreground">New York, NY 10001 · Showing {filtered.length} hospitals within 5 km</p>
          </div>
          <button onClick={() => setLocated(false)} className="btn-secondary text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Update
          </button>
        </div>
      )}

      {/* Map Placeholder */}
      <div className="medical-card overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, hsl(213 94% 39% / 0.15) 40px, hsl(213 94% 39% / 0.15) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(213 94% 39% / 0.15) 40px, hsl(213 94% 39% / 0.15) 41px)" }} />
          </div>
          {located && mockHospitals.map((h, idx) => (
            <div key={h.id} className="absolute animate-fade-in" style={{ top: `${25 + idx * 12}%`, left: `${20 + idx * 18}%` }}>
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary shadow-lg flex items-center justify-center text-white text-xs font-bold hover:scale-125 transition-transform">
                  {idx + 1}
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
                  {h.name}
                </div>
              </div>
            </div>
          ))}
          {!located && (
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">Enable GPS to see map</p>
            </div>
          )}
          {located && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-foreground shadow">
                📍 New York, NY
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      {located && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="medical-input pl-10" placeholder="Search hospitals..." />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="medical-input w-auto px-3 py-2.5">
              <option value="distance">Sort: Distance</option>
              <option value="rating">Sort: Rating</option>
            </select>
          </div>

          {/* Hospital Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((hospital, idx) => (
              <div key={hospital.id} className="medical-card p-5 hover:shadow-card transition-shadow animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{hospital.name}</h3>
                      <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full flex-shrink-0">
                        {hospital.distance}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {hospital.address}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                        <span className="text-xs font-semibold text-foreground">{hospital.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> {hospital.beds} beds
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> Est. {hospital.founded}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {hospital.specialization.map((s) => (
                        <span key={s} className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {hospital.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/hospitals/${hospital.id}/doctors`)}
                    className="btn-primary flex-1 text-xs py-2"
                  >
                    View Doctors <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HospitalFinder;
