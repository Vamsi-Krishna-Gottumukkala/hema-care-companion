import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  ChevronRight,
  Building2,
  Loader2,
  Search,
  RefreshCw,
  Clock,
  Users,
  X,
  CheckCircle,
} from "lucide-react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { hospitalsApi, type Hospital } from "@/services/api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

const HospitalFinder = () => {
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationName, setLocationName] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(
    null,
  );

  const [viewState, setViewState] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4, // Default to India overview
  });

  const requestLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setViewState({ latitude: lat, longitude: lng, zoom: 11 });
          setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          try {
            const result = await hospitalsApi.searchNearby(lat, lng, 15000);
            setHospitals(result.hospitals);
          } catch {
            setHospitals([]);
          }
          setLocating(false);
          setLocated(true);
        },
        () => {
          setLocating(false);
          alert(
            "Location access denied. Please enable GPS or select a point on the map manually.",
          );
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setLocating(false);
      alert("Geolocation not supported by your browser.");
    }
  };

  const handleMapClick = async (e: any) => {
    if (!MAPBOX_TOKEN) return;
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;
    setCoords({ lat, lng });
    setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setLocating(true);
    setSearch("");
    try {
      const result = await hospitalsApi.searchNearby(lat, lng, 15000);
      setHospitals(result.hospitals);
      setLocationName("Custom Location");
      setLocated(true);
    } catch {
      setHospitals([]);
    }
    setLocating(false);
  };

  const filtered = hospitals
    .filter(
      (h) =>
        (h.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (h.address || "").toLowerCase().includes(search.toLowerCase()),
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
            <h1 className="text-2xl font-bold font-display">
              GPS Hospital Finder
            </h1>
            <p className="text-sm text-muted-foreground">
              Find nearby hematology & oncology specialists
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="medical-card overflow-hidden h-[500px] relative">
        {!MAPBOX_TOKEN ? (
          <div className="h-full w-full flex flex-col items-center justify-center bg-muted/30">
            <Building2 className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground font-medium">
              Mapbox API Key Missing
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Please add VITE_MAPBOX_API_KEY to your frontend .env file.
            </p>
          </div>
        ) : (
          <>
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              onClick={handleMapClick}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={MAPBOX_TOKEN}
              cursor={locating ? "wait" : "crosshair"}
            >
              <NavigationControl position="bottom-right" />

              {/* User / Selected Coordinates Marker */}
              {coords && (
                <Marker
                  longitude={coords.lng}
                  latitude={coords.lat}
                  anchor="center"
                >
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <div className="absolute w-full h-full bg-primary/20 rounded-full animate-ping" />
                    <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm" />
                  </div>
                </Marker>
              )}

              {/* Hospital Markers */}
              {filtered.map(
                (h, i) =>
                  h.lng &&
                  h.lat && (
                    <Marker
                      key={h.id || i}
                      longitude={h.lng}
                      latitude={h.lat}
                      anchor="bottom"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedHospital(h);
                      }}
                    >
                      <div className="group cursor-pointer">
                        <div
                          className={`flex flex-col items-center drop-shadow-md group-hover:drop-shadow-lg transition-all scale-100 group-hover:scale-110 ${h.source === "manual" ? "text-success" : "text-danger"}`}
                        >
                          <MapPin
                            className={`h-8 w-8 ${h.source === "manual" ? "fill-success/20" : "fill-danger/20"}`}
                          />
                          <span className="sr-only">{h.name}</span>
                        </div>
                      </div>
                    </Marker>
                  ),
              )}

              {/* Popup for Selected Hospital */}
              {selectedHospital &&
                selectedHospital.lng &&
                selectedHospital.lat && (
                  <Popup
                    longitude={selectedHospital.lng}
                    latitude={selectedHospital.lat}
                    anchor="bottom"
                    offset={[0, -32]}
                    closeButton={false}
                    onClose={() => setSelectedHospital(null)}
                    className="rounded-xl overflow-hidden"
                  >
                    <div className="p-1 min-w-[200px]">
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h4 className="font-bold text-sm text-foreground">
                          {selectedHospital.name}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHospital(null);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      {selectedHospital.address && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {selectedHospital.address}
                        </p>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        Get Directions <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </Popup>
                )}
            </Map>

            {/* Overlay UI Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-start gap-4 pointer-events-none">
              <div className="bg-card/90 backdrop-blur border border-border rounded-xl p-4 shadow-sm flex-1 max-w-sm pointer-events-auto transition-transform">
                <h3 className="font-medium text-sm flex items-center gap-2 mb-3">
                  <Navigation className="h-4 w-4 text-primary" /> Location
                  Search
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={requestLocation}
                    disabled={locating}
                    className="btn-primary w-full shadow-sm"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Locating...
                      </>
                    ) : (
                      "Use Current GPS Location"
                    )}
                  </button>
                  <div className="text-center text-xs text-muted-foreground font-medium">
                    OR
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Click anywhere on the map to search 15km around that point.
                  </p>
                </div>
              </div>

              {located && (
                <div className="bg-success-light/90 backdrop-blur border border-success/20 rounded-xl px-4 py-2 shadow-sm pointer-events-auto flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Found {filtered.length} specialists nearby
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Search & Filter */}
      {located && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="medical-input pl-10"
                placeholder="Search hospitals..."
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="medical-input w-auto px-3 py-2.5"
            >
              <option value="distance">Sort: Distance</option>
              <option value="rating">Sort: Rating</option>
            </select>
          </div>

          {/* Hospital Cards */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No hospitals found nearby. Try increasing the search radius.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((hospital, idx) => (
                <div
                  key={hospital.id || idx}
                  className="medical-card p-5 hover:shadow-card transition-shadow animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">
                        {hospital.name}
                      </h3>
                      {hospital.address && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {hospital.address}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {hospital.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                            <span className="text-xs font-semibold text-foreground">
                              {hospital.rating}
                            </span>
                          </div>
                        )}
                        {hospital.beds && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" /> {hospital.beds} beds
                          </div>
                        )}
                        {hospital.founded && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> Est.{" "}
                            {hospital.founded}
                          </div>
                        )}
                      </div>
                      {hospital.specializations &&
                        hospital.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {hospital.specializations.map((s) => (
                              <span
                                key={s}
                                className="text-xs bg-secondary text-accent px-2 py-0.5 rounded-full"
                              >
                                {s}
                              </span>
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
