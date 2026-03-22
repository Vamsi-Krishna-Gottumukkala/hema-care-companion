import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin, Navigation, Star, Phone, ChevronRight, Building2,
  Loader2, Search, RefreshCw, Clock, Users
} from "lucide-react";
import { hospitalsApi, type Hospital } from "@/services/api";

const HospitalFinder = () => {
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("");

  const requestLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          try {
            const result = await hospitalsApi.searchNearby(lat, lng, 5000);
            setHospitals(result.hospitals);
          } catch {
            setHospitals([]);
          }
          setLocating(false);
          setLocated(true);
        },
        () => {
          // Fallback: use default location
          setLocating(false);
          alert("Location access denied. Please enable GPS in your browser settings.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocating(false);
      alert("Geolocation not supported by your browser.");
    }
  };

  const filtered = hospitals
    .filter((h) =>
      (h.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.address || "").toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0; // Keep API order for distance
    });

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
            <p className="text-xs text-muted-foreground">{locationName} · Showing {filtered.length} hospitals nearby</p>
          </div>
          <button onClick={() => { setLocated(false); setHospitals([]); }} className="btn-secondary text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Update
          </button>
        </div>
      )}

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
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hospitals found nearby. Try increasing the search radius.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((hospital, idx) => (
                <div key={hospital.id || idx} className="medical-card p-5 hover:shadow-card transition-shadow animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{hospital.name}</h3>
                      {hospital.address && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {hospital.address}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {hospital.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            <span className="text-xs font-semibold text-foreground">{hospital.rating}</span>
                          </div>
                        )}
                        {hospital.beds && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" /> {hospital.beds} beds
                          </div>
                        )}
                        {hospital.founded && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> Est. {hospital.founded}
                          </div>
                        )}
                      </div>
                      {hospital.specializations && hospital.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {hospital.specializations.map((s) => (
                            <span key={s} className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      {hospital.phone && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {hospital.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {hospital.lat && hospital.lng && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Directions
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HospitalFinder;
