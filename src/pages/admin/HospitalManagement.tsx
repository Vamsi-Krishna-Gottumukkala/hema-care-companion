import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, MapPin, Star, Phone, Loader2, Map, X } from "lucide-react";
import { Country, State, City } from "country-state-city";
import { hospitalsApi, adminApi, type Hospital } from "@/services/api";

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Location Cascade State
  const [countryCode, setCountryCode] = useState("IN"); // Default to India for convenience
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");

  const countries = Country.getAllCountries();
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];
  const cities = stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];

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

  const handleAddHospital = async () => {
    if (!hospitalName || !latitude || !longitude || !countryCode || !stateCode || !cityName) return;
    setAdding(true);
    
    // Build full address string out of hierarchical dropdowns
    const countryName = Country.getCountryByCode(countryCode)?.name || "";
    const stateName = State.getStateByCodeAndCountry(stateCode, countryCode)?.name || "";
    const fullAddress = [hospitalAddress, cityName, stateName, countryName].filter(Boolean).join(", ");

    try {
      const newHospital = await adminApi.createHospital({
        name: hospitalName,
        address: fullAddress,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        specializations: ["Oncology", "Hematology"],
        source: "manual"
      });
      setHospitals([newHospital, ...hospitals]);
      setShowModal(false);
      
      // Cleanup
      setHospitalName("");
      setHospitalAddress("");
      setLatitude("");
      setLongitude("");
    } catch {
      alert("Failed to create hospital. Ensure Lat/Lng are valid numbers.");
    }
    setAdding(false);
  };

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
        <button onClick={() => setShowModal(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add Hospital
        </button>
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

      {/* Add Hospital Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Add Hospital
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Hospital Name *</label>
                <input 
                  type="text" 
                  className="medical-input" 
                  placeholder="e.g. City General Hospital" 
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              </div>

              {/* Hierarchical Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Country *</label>
                  <select 
                    className="medical-input bg-card appearance-none" 
                    value={countryCode} 
                    onChange={(e) => { setCountryCode(e.target.value); setStateCode(""); setCityName(""); }}
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">State / Region *</label>
                  <select 
                    className="medical-input bg-card appearance-none" 
                    value={stateCode} 
                    onChange={(e) => { setStateCode(e.target.value); setCityName(""); }}
                    disabled={!countryCode}
                  >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">City / District *</label>
                <select 
                  className="medical-input bg-card appearance-none" 
                  value={cityName} 
                  onChange={(e) => setCityName(e.target.value)}
                  disabled={!stateCode}
                >
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Street Address (Optional)</label>
                <input 
                  type="text" 
                  className="medical-input" 
                  placeholder="e.g. 123 Health Ave" 
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Latitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    className="medical-input" 
                    placeholder="e.g. 17.3850" 
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Longitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    className="medical-input" 
                    placeholder="e.g. 78.4867" 
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button 
                  onClick={handleAddHospital} 
                  disabled={!hospitalName || !latitude || !longitude || !cityName || adding} 
                  className="btn-primary flex-1 gap-2"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Hospital
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HospitalManagement;
