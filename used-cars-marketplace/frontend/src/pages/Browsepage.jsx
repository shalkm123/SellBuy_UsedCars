import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addWishlistItem,
  getAllCars,
  getMyWishlist,
  removeWishlistItem,
} from "../api";

const BRANDS = ["All", "Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra", "Kia", "Ford"];
const FUEL_TYPES = ["All", "Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const TRANSMISSIONS = ["All", "Manual", "Automatic", "CVT"];
const CITIES = ["All", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];
const SORT_OPTIONS = [
  { value: "price_asc",   label: "Price: Low to High" },
  { value: "price_desc",  label: "Price: High to Low" },
  { value: "year_desc",   label: "Newest First" },
];

export default function BrowsePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [cars,         setCars]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState(searchParams.get("q") || "");
  const [brand,        setBrand]        = useState("All");
  const [fuel,         setFuel]         = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [city,         setCity]         = useState("All");
  const [maxPrice,     setMaxPrice]     = useState(3000000);
  const [sort,         setSort]         = useState("price_asc");
  const [viewMode,     setViewMode]     = useState("grid");
  const [wishlist,     setWishlist]     = useState([]);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const toId = (value) => String(value);

  useEffect(() => {
    const loadSelectionState = async () => {
      if (String(user?.role || "").toLowerCase() === "buyer") {
        try {
          const res = await getMyWishlist();
          const ids = (res.data?.items || []).map((item) => toId(item.id));
          setWishlist(ids);
        } catch {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };

    loadSelectionState();
  }, [user]);

  const fetchCars = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search)                     params.search       = search;
      if (brand !== "All")            params.brand        = brand;
      if (fuel !== "All")             params.fuel         = fuel;
      if (transmission !== "All")     params.transmission = transmission;
      if (city !== "All")             params.city         = city;
      params.max_price = maxPrice;
      const res = await getAllCars(params);
      setCars(res.data);
    } catch {
      setError("Failed to load cars. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, [brand, fuel, transmission, city, maxPrice]);

  const handleSearch = (e) => { e.preventDefault(); fetchCars(); };

  // Client-side sort
  const sorted = [...cars].sort((a, b) => {
    if (sort === "price_asc")  return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "year_desc")  return (b.year || 2020) - (a.year || 2020);
    return 0;
  });

  const toggleWishlist = async (id) => {
    const carId = toId(id);
    if (String(user?.role || "").toLowerCase() !== "buyer") {
      navigate("/login");
      return;
    }
    const isSaved = wishlist.includes(carId);
    setWishlist((prev) => (isSaved ? prev.filter((item) => item !== carId) : [...prev, carId]));

    try {
      if (isSaved) {
        await removeWishlistItem(carId);
      } else {
        await addWishlistItem({ car_id: carId });
      }
    } catch {
      setWishlist((prev) => (isSaved ? [...prev, carId] : prev.filter((item) => item !== carId)));
    }
  };
  const clearFilters    = () => { setSearch(""); setBrand("All"); setFuel("All"); setTransmission("All"); setCity("All"); setMaxPrice(3000000); };

  return (
    <div style={{ background: "#080808", color: "#e5e7eb", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingTop: "70px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .car-card:hover { border-color: rgba(245,158,11,0.4) !important; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .car-card { transition: all 0.3s ease; }
        .filter-btn:hover { background: rgba(245,158,11,0.1) !important; color: #f59e0b !important; border-color: rgba(245,158,11,0.3) !important; }
        .filter-btn.active { background: #f59e0b !important; color: #000 !important; border-color: #f59e0b !important; }
        .filter-btn { transition: all 0.2s ease; }
        .wish-btn:hover { color: #ef4444 !important; }
        input[type='range'] { accent-color: #f59e0b; }
        select { color-scheme: dark; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.1em", cursor: "pointer" }}>
          ← AUTO<span style={{ color: "#fff" }}>BAZAAR</span>
        </button>

        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: 0, maxWidth: "500px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand, model, city..."
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRight: "none", borderRadius: "6px 0 0 6px", padding: "0.7rem 1rem", color: "#e5e7eb", fontSize: "0.9rem", outline: "none" }} />
          <button type="submit" style={{ background: "#f59e0b", border: "none", borderRadius: "0 6px 6px 0", padding: "0.7rem 1.25rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", cursor: "pointer" }}>SEARCH</button>
        </form>

        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.7rem 1rem", color: "#e5e7eb", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>)}
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["grid", "list"].map((m) => (
            <button key={m} onClick={() => setViewMode(m)} style={{ background: viewMode === m ? "#f59e0b" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.6rem 0.8rem", color: viewMode === m ? "#000" : "#9ca3af", cursor: "pointer", fontSize: "0.9rem" }}>
              {m === "grid" ? "⊞" : "≡"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        {/* SIDEBAR */}
        <aside style={{ width: sidebarOpen ? "280px" : "0", minWidth: sidebarOpen ? "280px" : "0", overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.06)", padding: sidebarOpen ? "2rem 1.5rem" : "0", transition: "all 0.3s ease", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", color: "#fff" }}>FILTERS</span>
            <button onClick={clearFilters} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em" }}>CLEAR ALL</button>
          </div>

          <FilterSection label="Brand">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {BRANDS.map((b) => <button key={b} className={`filter-btn ${brand === b ? "active" : ""}`} onClick={() => setBrand(b)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "4px 12px", color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer" }}>{b}</button>)}
            </div>
          </FilterSection>

          <FilterSection label={`Max Price: ₹${(maxPrice / 100000).toFixed(1)}L`}>
            <input type="range" min={100000} max={3000000} step={50000} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} style={{ width: "100%", marginTop: "0.5rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}><span>₹1L</span><span>₹30L</span></div>
          </FilterSection>

          <FilterSection label="Fuel Type">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {FUEL_TYPES.map((f) => <button key={f} className={`filter-btn ${fuel === f ? "active" : ""}`} onClick={() => setFuel(f)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "4px 12px", color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer" }}>{f}</button>)}
            </div>
          </FilterSection>

          <FilterSection label="Transmission">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TRANSMISSIONS.map((t) => <button key={t} className={`filter-btn ${transmission === t ? "active" : ""}`} onClick={() => setTransmission(t)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "4px 12px", color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer" }}>{t}</button>)}
            </div>
          </FilterSection>

          <FilterSection label="City">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {CITIES.map((c) => <button key={c} className={`filter-btn ${city === c ? "active" : ""}`} onClick={() => setCity(c)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "4px 12px", color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer" }}>{c}</button>)}
            </div>
          </FilterSection>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.05em" }}>{loading ? "..." : sorted.length}</span>
              <span style={{ color: "#6b7280", fontSize: "0.9rem", marginLeft: "8px" }}>cars found</span>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.5rem 1rem", color: "#9ca3af", fontSize: "0.82rem", cursor: "pointer" }}>
              {sidebarOpen ? "← Hide" : "→ Show"} Filters
            </button>
          </div>

          {loading && <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "4rem" }}>Loading cars...</p>}
          {error   && <p style={{ color: "#ef4444", textAlign: "center", padding: "2rem" }}>{error}</p>}

          {!loading && !error && (
            viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                {sorted.map((car, i) => (
                  <CarGridCard key={car.id} car={car} i={i}
                    wishlisted={wishlist.includes(String(car.id))}
                    onWishlist={() => toggleWishlist(car.id)}
                    onClick={() => navigate(`/car/${car.id}`)} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sorted.map((car, i) => (
                  <CarListCard key={car.id} car={car} i={i}
                    wishlisted={wishlist.includes(String(car.id))}
                    onWishlist={() => toggleWishlist(car.id)}
                    onClick={() => navigate(`/car/${car.id}`)} />
                ))}
              </div>
            )
          )}

          {!loading && !error && sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "#fff", marginBottom: "0.5rem" }}>NO RESULTS FOUND</h3>
              <p style={{ color: "#6b7280" }}>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} style={{ marginTop: "1.5rem", background: "#f59e0b", border: "none", borderRadius: "6px", padding: "0.75rem 2rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", cursor: "pointer" }}>CLEAR FILTERS</button>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

function FilterSection({ label, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", color: "#9ca3af", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", marginBottom: "0.75rem", padding: 0 }}>
        {label}<span style={{ color: "#4b5563" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && children}
    </div>
  );
}

function CarGridCard({ car, i, wishlisted, onWishlist, onClick }) {
  const imgUrl = car.image || car.image_url || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80`;
  const trustScoreLabel = car.trustScore == null ? "Score pending" : `${car.trustScore}/100`;
  const trustTone = car.trustScore == null ? "#6b7280" : car.trustScore >= 85 ? "#22c55e" : car.trustScore >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="car-card" onClick={onClick} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", animation: `fadeUp 0.5s ${i * 0.05}s ease both` }}>
      <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
        <img src={imgUrl} alt={car.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }} />
        <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
          <div style={{ background: "rgba(0,0,0,0.8)", border: `1px solid ${trustTone}55`, borderRadius: "999px", padding: "4px 8px", fontSize: "0.7rem", color: trustTone, fontWeight: 700, backdropFilter: "blur(8px)" }}>
            {trustScoreLabel}
          </div>
          <button className="wish-btn" onClick={(e) => { e.stopPropagation(); onWishlist(); }} style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", width: "32px", height: "32px", color: wishlisted ? "#ef4444" : "#9ca3af", cursor: "pointer", fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {wishlisted ? "♥" : "♡"}
          </button>
        </div>
      </div>
      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#fff" }}>{car.title}</h3>
          <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem" }}>₹{(car.price / 100000).toFixed(1)}L</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.75rem" }}>
          {car.city && <span>📍 {car.city}</span>}
          <span>🛣 {Number(car.km_driven).toLocaleString()} km</span>
          <span>{car.year}</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[car.fuel, car.transmission].map((tag) => (
            <span key={tag} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "2px 8px", fontSize: "0.72rem", color: "#9ca3af" }}>{tag}</span>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: car.trustScore == null ? "#9ca3af" : trustTone, fontWeight: 700 }}>
          Trust: {trustScoreLabel}
        </div>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>by {car.seller_name}</p>
      </div>
    </div>
  );
}

function CarListCard({ car, i, wishlisted, onWishlist, onClick }) {
  const imgUrl = car.image || car.image_url || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80`;
  const trustScoreLabel = car.trustScore == null ? "Score pending" : `${car.trustScore}/100`;
  const trustTone = car.trustScore == null ? "#6b7280" : car.trustScore >= 85 ? "#22c55e" : car.trustScore >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="car-card" onClick={onClick} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", display: "flex", animation: `fadeUp 0.5s ${i * 0.05}s ease both` }}>
      <div style={{ width: "220px", flexShrink: 0, overflow: "hidden" }}>
        <img src={imgUrl} alt={car.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, padding: "1.25rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.04em", color: "#fff", marginBottom: "0.25rem" }}>{car.title}</h3>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>
            {car.city && <span>📍 {car.city}</span>}
            <span>🛣 {Number(car.km_driven).toLocaleString()} km</span>
            <span>📅 {car.year}</span>
            <span>⛽ {car.fuel}</span>
            <span>⚙️ {car.transmission}</span>
          </div>
          <div style={{ fontSize: 12, color: trustTone, fontWeight: 700, marginBottom: 8 }}>Trust: {trustScoreLabel}</div>
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "400px" }}>{car.description || "Well-maintained vehicle. All documents up to date."}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "2rem" }}>₹{(car.price / 100000).toFixed(1)}L</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="wish-btn" onClick={(e) => { e.stopPropagation(); onWishlist(); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.5rem 0.75rem", color: wishlisted ? "#ef4444" : "#9ca3af", cursor: "pointer", fontSize: "0.9rem" }}>
              {wishlisted ? "♥" : "♡"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ background: "#f59e0b", border: "none", borderRadius: "6px", padding: "0.5rem 1.25rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.08em", cursor: "pointer" }}>VIEW →</button>
          </div>
        </div>
      </div>
    </div>
  );
}