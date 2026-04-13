import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockCars as cars } from "../data/mockData";

const BRANDS = ["All", "Maruti Suzuki", "Hyundai", "Honda", "Toyota", "Tata", "Mahindra", "Kia", "Ford"];
const FUEL_TYPES = ["All", "Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const TRANSMISSIONS = ["All", "Manual", "Automatic", "CVT"];
const CITIES = ["All", "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"];

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Newest First" },
  { value: "trust_desc", label: "Highest Trust Score" },
];

export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [brand, setBrand] = useState("All");
  const [fuel, setFuel] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [city, setCity] = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000000);
  const [sort, setSort] = useState("price_asc");
  const [viewMode, setViewMode] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filtered = cars
    .filter((c) => {
      // c.title, c.city, c.brand, c.fuel, c.transmission match mockData field names
      if (search && !`${c.title} ${c.city} ${c.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (brand !== "All" && c.brand !== brand) return false;
      if (fuel !== "All" && c.fuel !== fuel) return false;
      if (transmission !== "All" && c.transmission !== transmission) return false;
      if (city !== "All" && c.city !== city) return false;
      if (c.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "year_desc") return (b.year || 2020) - (a.year || 2020);
      if (sort === "trust_desc") return (b.trustScore || 4) - (a.trustScore || 4);
      return 0;
    });

  const toggleWishlist = (id) =>
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  const toggleCompare = (id) =>
    setCompareList((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));
  const clearFilters = () => {
    setSearch(""); setBrand("All"); setFuel("All");
    setTransmission("All"); setCity("All"); setMaxPrice(3000000);
  };

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
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "1.25rem 2rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        background: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", color: "#f59e0b",
          fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
          letterSpacing: "0.1em", cursor: "pointer"
        }}>← AUTO<span style={{ color: "#fff" }}>BAZAAR</span></button>

        <div style={{ flex: 1, display: "flex", gap: "0", maxWidth: "500px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, city..."
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRight: "none",
              borderRadius: "6px 0 0 6px", padding: "0.7rem 1rem",
              color: "#e5e7eb", fontSize: "0.9rem", outline: "none",
            }}
          />
          <button style={{
            background: "#f59e0b", border: "none", borderRadius: "0 6px 6px 0",
            padding: "0.7rem 1.25rem", color: "#000",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
            letterSpacing: "0.08em", cursor: "pointer"
          }}>
            SEARCH
          </button>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px", padding: "0.7rem 1rem",
            color: "#e5e7eb", fontSize: "0.85rem", outline: "none", cursor: "pointer"
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["grid", "list"].map((m) => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              background: viewMode === m ? "#f59e0b" : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", padding: "0.6rem 0.8rem",
              color: viewMode === m ? "#000" : "#9ca3af", cursor: "pointer", fontSize: "0.9rem"
            }}>
              {m === "grid" ? "⊞" : "≡"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 65px)" }}>
        {/* SIDEBAR */}
        <aside style={{
          width: sidebarOpen ? "280px" : "0",
          minWidth: sidebarOpen ? "280px" : "0",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: sidebarOpen ? "2rem 1.5rem" : "0",
          transition: "all 0.3s ease",
          background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", color: "#fff" }}>
              FILTERS
            </span>
            <button onClick={clearFilters} style={{
              background: "none", border: "none", color: "#f59e0b",
              fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.05em"
            }}>CLEAR ALL</button>
          </div>

          <FilterSection label="Brand">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {BRANDS.map((b) => (
                <button key={b} className={`filter-btn ${brand === b ? "active" : ""}`}
                  onClick={() => setBrand(b)}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "100px", padding: "4px 12px",
                    color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer"
                  }}>
                  {b}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label={`Max Price: ₹${(maxPrice / 100000).toFixed(1)}L`}>
            <input type="range" min={100000} max={3000000} step={50000}
              value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)}
              style={{ width: "100%", marginTop: "0.5rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
              <span>₹1L</span><span>₹30L</span>
            </div>
          </FilterSection>

          <FilterSection label="Fuel Type">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {FUEL_TYPES.map((f) => (
                <button key={f} className={`filter-btn ${fuel === f ? "active" : ""}`}
                  onClick={() => setFuel(f)}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "100px", padding: "4px 12px",
                    color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer"
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="Transmission">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TRANSMISSIONS.map((t) => (
                <button key={t} className={`filter-btn ${transmission === t ? "active" : ""}`}
                  onClick={() => setTransmission(t)}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "100px", padding: "4px 12px",
                    color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer"
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection label="City">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {CITIES.map((c) => (
                <button key={c} className={`filter-btn ${city === c ? "active" : ""}`}
                  onClick={() => setCity(c)}
                  style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "100px", padding: "4px 12px",
                    color: "#9ca3af", fontSize: "0.78rem", cursor: "pointer"
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </FilterSection>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: "#fff", letterSpacing: "0.05em" }}>
                {filtered.length}
              </span>
              <span style={{ color: "#6b7280", fontSize: "0.9rem", marginLeft: "8px" }}>cars found</span>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", padding: "0.5rem 1rem", color: "#9ca3af",
              fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
            }}>
              {sidebarOpen ? "← Hide" : "→ Show"} Filters
            </button>
          </div>

          {viewMode === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem"
            }}>
              {filtered.map((car, i) => (
                <CarGridCard
                  key={car.id} car={car} i={i}
                  wishlisted={wishlist.includes(car.id)}
                  compared={compareList.includes(car.id)}
                  onWishlist={() => toggleWishlist(car.id)}
                  onCompare={() => toggleCompare(car.id)}
                  onClick={() => navigate(`/car/${car.id}`)}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filtered.map((car, i) => (
                <CarListCard
                  key={car.id} car={car} i={i}
                  wishlisted={wishlist.includes(car.id)}
                  compared={compareList.includes(car.id)}
                  onWishlist={() => toggleWishlist(car.id)}
                  onCompare={() => toggleCompare(car.id)}
                  onClick={() => navigate(`/car/${car.id}`)}
                />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: "#fff", marginBottom: "0.5rem" }}>
                NO RESULTS FOUND
              </h3>
              <p style={{ color: "#6b7280" }}>Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} style={{
                marginTop: "1.5rem", background: "#f59e0b", border: "none",
                borderRadius: "6px", padding: "0.75rem 2rem", color: "#000",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                letterSpacing: "0.08em", cursor: "pointer"
              }}>
                CLEAR FILTERS
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div style={{
          position: "fixed", bottom: "1.5rem", left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(15,15,15,0.95)",
          border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: "12px", padding: "1rem 1.5rem",
          display: "flex", alignItems: "center", gap: "1rem",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          zIndex: 100,
        }}>
          <span style={{ color: "#f59e0b", fontSize: "0.85rem", fontWeight: 600 }}>
            {compareList.length}/3 selected
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {compareList.map((id) => {
              const c = cars.find((x) => x.id === id);
              return (
                <div key={id} style={{
                  background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                  borderRadius: "6px", padding: "4px 10px",
                  fontSize: "0.78rem", color: "#f59e0b",
                  display: "flex", alignItems: "center", gap: "6px"
                }}>
                  {c?.title}  {/* fixed: was c?.name */}
                  <button onClick={() => toggleCompare(id)} style={{
                    background: "none", border: "none", color: "#f59e0b",
                    cursor: "pointer", fontSize: "0.9rem", padding: 0
                  }}>×</button>
                </div>
              );
            })}
          </div>
          <button onClick={() => navigate("/compare")} style={{
            background: "#f59e0b", border: "none", borderRadius: "6px",
            padding: "0.5rem 1.25rem", color: "#000",
            fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem",
            letterSpacing: "0.08em", cursor: "pointer"
          }}>
            COMPARE NOW →
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "none",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: "100%", color: "#9ca3af", fontSize: "0.78rem",
        letterSpacing: "0.12em", textTransform: "uppercase",
        cursor: "pointer", marginBottom: "0.75rem", padding: 0,
      }}>
        {label}
        <span style={{ color: "#4b5563" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && children}
    </div>
  );
}

function CarGridCard({ car, i, wishlisted, compared, onWishlist, onCompare, onClick }) {
  return (
    <div className="car-card" onClick={onClick} style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px", overflow: "hidden", cursor: "pointer",
      animation: `fadeUp 0.5s ${i * 0.05}s ease both`,
    }}>
      <div style={{ position: "relative", height: "190px", overflow: "hidden" }}>
        <img
          src={car.image || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80`}
          alt={car.title}  /* fixed: was car.name */
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)"
        }} />
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          display: "flex", gap: "6px"
        }}>
          <button className="wish-btn" onClick={(e) => { e.stopPropagation(); onWishlist(); }} style={{
            background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px", width: "32px", height: "32px",
            color: wishlisted ? "#ef4444" : "#9ca3af",
            cursor: "pointer", fontSize: "0.9rem", display: "flex",
            alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)"
          }}>
            {wishlisted ? "♥" : "♡"}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onCompare(); }} style={{
            background: compared ? "rgba(245,158,11,0.8)" : "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px", width: "32px", height: "32px",
            color: compared ? "#000" : "#9ca3af",
            cursor: "pointer", fontSize: "0.7rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)"
          }}>
            ⊕
          </button>
        </div>
        <div style={{
          position: "absolute", bottom: "10px", left: "10px",
          background: "rgba(0,0,0,0.8)", border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: "4px", padding: "2px 8px",
          fontSize: "0.72rem", color: "#f59e0b", fontWeight: 600
        }}>
          ★ {car.trustScore || "4.8"}
        </div>
      </div>

      <div style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", color: "#fff" }}>
            {car.title}  {/* fixed: was car.name */}
          </h3>
          <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem" }}>
            ₹{(car.price / 100000).toFixed(1)}L
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.75rem" }}>
          <span>📍 {car.city}</span>          {/* fixed: was car.location */}
          <span>🛣 {car.km?.toLocaleString() || "45k"} km</span>
          <span>{car.year || "2021"}</span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[car.fuel || "Petrol", car.transmission || "Manual"].map((tag) => (  /* fixed: was car.fuelType */
            <span key={tag} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "4px", padding: "2px 8px", fontSize: "0.72rem", color: "#9ca3af"
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CarListCard({ car, i, wishlisted, compared, onWishlist, onCompare, onClick }) {
  return (
    <div className="car-card" onClick={onClick} style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px", overflow: "hidden", cursor: "pointer",
      display: "flex", animation: `fadeUp 0.5s ${i * 0.05}s ease both`,
    }}>
      <div style={{ width: "220px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <img
          src={car.image || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80`}
          alt={car.title}  /* fixed: was car.name */
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", bottom: "8px", left: "8px",
          background: "rgba(0,0,0,0.8)", border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: "4px", padding: "2px 8px",
          fontSize: "0.72rem", color: "#f59e0b", fontWeight: 600
        }}>
          ★ {car.trustScore || "4.8"}
        </div>
      </div>

      <div style={{ flex: 1, padding: "1.25rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.04em", color: "#fff", marginBottom: "0.25rem" }}>
            {car.title}  {/* fixed: was car.name */}
          </h3>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.75rem" }}>
            <span>📍 {car.city}</span>               {/* fixed: was car.location */}
            <span>🛣 {car.km?.toLocaleString() || "45,000"} km</span>
            <span>📅 {car.year || "2021"}</span>
            <span>⛽ {car.fuel || "Petrol"}</span>   {/* fixed: was car.fuelType */}
            <span>⚙️ {car.transmission || "Manual"}</span>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.5, maxWidth: "400px" }}>
            {car.description || "Well-maintained vehicle with single owner. All documents up to date."}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
          <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "2rem" }}>
            ₹{(car.price / 100000).toFixed(1)}L
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="wish-btn" onClick={(e) => { e.stopPropagation(); onWishlist(); }} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px", padding: "0.5rem 0.75rem",
              color: wishlisted ? "#ef4444" : "#9ca3af", cursor: "pointer", fontSize: "0.9rem"
            }}>
              {wishlisted ? "♥" : "♡"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
              background: "#f59e0b", border: "none", borderRadius: "6px",
              padding: "0.5rem 1.25rem", color: "#000",
              fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
              letterSpacing: "0.08em", cursor: "pointer"
            }}>
              VIEW →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}