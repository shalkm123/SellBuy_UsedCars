import { useState } from "react";

const ALL_CARS = [
  {
    id: 1,
    name: "Honda City ZX",
    brand: "Honda",
    price: 1529000,
    priceStr: "₹15.29L",
    year: 2023,
    fuel: "Petrol",
    transmission: "CVT",
    engine: "1.5L i-VTEC",
    power: "121 bhp",
    torque: "145 Nm",
    mileage: "18.4 km/L",
    seating: 5,
    bootSpace: "506L",
    safetyRating: 5,
    color: "#dc2626",
    emoji: "🚗",
    features: ["Sunroof", "Lane Watch", "Honda Sensing", "Wireless CarPlay", "6 Airbags", "360° Camera"],
    pros: ["Best in class mileage", "Premium interior", "Advanced safety"],
    cons: ["No diesel option", "Expensive maintenance"],
    score: 87,
  },
  {
    id: 2,
    name: "Maruti Ciaz Alpha",
    brand: "Maruti Suzuki",
    price: 1284000,
    priceStr: "₹12.84L",
    year: 2023,
    fuel: "Petrol",
    transmission: "AT",
    engine: "1.5L K15C",
    power: "103 bhp",
    torque: "137 Nm",
    mileage: "20.09 km/L",
    seating: 5,
    bootSpace: "510L",
    safetyRating: 4,
    color: "#2563eb",
    emoji: "🚙",
    features: ["360° Camera", "HUD", "SmartPlay Pro+", "Wireless Charging", "4 Airbags", "SHVS Hybrid"],
    pros: ["Highest mileage", "Huge boot space", "Low ownership cost"],
    cons: ["Less powerful", "Dated exterior"],
    score: 78,
  },
  {
    id: 3,
    name: "Hyundai Verna SX+",
    brand: "Hyundai",
    price: 1765000,
    priceStr: "₹17.65L",
    year: 2023,
    fuel: "Diesel",
    transmission: "DCT",
    engine: "1.5L U2 CRDi",
    power: "116 bhp",
    torque: "250 Nm",
    mileage: "21.7 km/L",
    seating: 5,
    bootSpace: "528L",
    safetyRating: 5,
    color: "#7c3aed",
    emoji: "🏎️",
    features: ["Panoramic Sunroof", "BOSE Audio", "ADAS Level 2", "Ventilated Seats", "6 Airbags", "Digital Cluster"],
    pros: ["Most features", "Strongest engine", "Best boot"],
    cons: ["Highest price", "Diesel maintenance"],
    score: 91,
  },
  {
    id: 4,
    name: "Toyota Camry Hybrid",
    brand: "Toyota",
    price: 4550000,
    priceStr: "₹45.50L",
    year: 2024,
    fuel: "Hybrid",
    transmission: "CVT",
    engine: "2.5L Hybrid",
    power: "218 bhp",
    torque: "221 Nm",
    mileage: "19.16 km/L",
    seating: 5,
    bootSpace: "524L",
    safetyRating: 5,
    color: "#0d9488",
    emoji: "🚘",
    features: ["JBL 9-Speaker", "Adaptive Cruise", "Head-up Display", "Heated Seats", "10 Airbags", "Toyota Safety Sense"],
    pros: ["Premium cabin", "Hybrid efficiency", "Toyota reliability"],
    cons: ["Very expensive", "Limited service"],
    score: 94,
  },
];

const SPEC_ROWS = [
  { key: "price", label: "Price", icon: "₹", format: (v) => v },
  { key: "engine", label: "Engine", icon: "⚙️", format: (v) => v },
  { key: "power", label: "Max Power", icon: "⚡", format: (v) => v },
  { key: "torque", label: "Max Torque", icon: "🔄", format: (v) => v },
  { key: "transmission", label: "Transmission", icon: "🔧", format: (v) => v },
  { key: "fuel", label: "Fuel Type", icon: "⛽", format: (v) => v },
  { key: "mileage", label: "Mileage", icon: "📏", format: (v) => v },
  { key: "seating", label: "Seating", icon: "💺", format: (v) => `${v} Persons` },
  { key: "bootSpace", label: "Boot Space", icon: "🧳", format: (v) => v },
  { key: "safetyRating", label: "Safety Rating", icon: "🛡️", format: (v) => `${v}/5 Stars` },
  { key: "year", label: "Model Year", icon: "📅", format: (v) => v },
];

const MAX_COMPARE = 3;

export default function ComparePage() {
  const [selected, setSelected] = useState([ALL_CARS[0], ALL_CARS[2]]);
  const [searchQuery, setSearchQuery] = useState("");
  const [winner, setWinner] = useState(null);
  const [activeTab, setActiveTab] = useState("specs");

  const filtered = ALL_CARS.filter(
    (c) =>
      !selected.find((s) => s.id === c.id) &&
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const addCar = (car) => {
    if (selected.length < MAX_COMPARE) setSelected([...selected, car]);
  };

  const removeCar = (id) => setSelected(selected.filter((c) => c.id !== id));

  const getWinner = (key) => {
    if (selected.length < 2) return null;
    if (key === "price") return selected.reduce((a, b) => (a.price < b.price ? a : b)).id;
    if (key === "mileage") return selected.reduce((a, b) => (parseFloat(a.mileage) > parseFloat(b.mileage) ? a : b)).id;
    if (key === "power") return selected.reduce((a, b) => (parseInt(a.power) > parseInt(b.power) ? a : b)).id;
    if (key === "torque") return selected.reduce((a, b) => (parseInt(a.torque) > parseInt(b.torque) ? a : b)).id;
    if (key === "bootSpace") return selected.reduce((a, b) => (parseInt(a.bootSpace) > parseInt(b.bootSpace) ? a : b)).id;
    if (key === "safetyRating") return selected.reduce((a, b) => (a.safetyRating > b.safetyRating ? a : b)).id;
    return null;
  };

  const overallWinner = selected.length > 1 ? selected.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .compare-root {
          min-height: 100vh;
          background: #080808;
          padding-top: 70px;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          position: relative;
        }

        .compare-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 20% 0%, rgba(245, 158, 11, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 90%, rgba(245, 158, 11, 0.04) 0%, transparent 50%);
          pointer-events: none;
        }

        .compare-hero {
          text-align: center;
          padding: 60px 24px 40px;
          position: relative;
          z-index: 1;
        }

        .compare-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .compare-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 7vw, 72px);
          letter-spacing: 3px;
          line-height: 1;
          margin-bottom: 16px;
        }

        .compare-title span { color: #f59e0b; }

        .compare-sub {
          color: rgba(255,255,255,0.4);
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .compare-container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 24px 80px;
          position: relative;
          z-index: 1;
        }

        /* Car selector bar */
        .selector-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .selected-car-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 10px 14px;
          transition: all 0.2s;
        }

        .chip-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .chip-name {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .chip-remove {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          border: none;
          color: #ef4444;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          line-height: 1;
        }

        .chip-remove:hover { background: rgba(239, 68, 68, 0.3); }

        .add-car-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px dashed rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 10px 16px;
          color: #f59e0b;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-car-btn:hover {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.5);
        }

        /* Winner banner */
        .winner-banner {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.06));
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
          animation: bannerIn 0.5s ease;
        }

        @keyframes bannerIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .winner-trophy { font-size: 36px; }

        .winner-text-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          color: #f59e0b;
          margin-bottom: 2px;
        }

        .winner-text-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        .winner-score {
          margin-left: auto;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 36px;
          color: #f59e0b;
        }

        .winner-score-label {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-top: -4px;
        }

        /* Tabs */
        .compare-tabs {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
          width: fit-content;
        }

        .compare-tab {
          padding: 10px 22px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: none;
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif;
        }

        .compare-tab.active {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        /* Spec table */
        .spec-table {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
        }

        .spec-table-header {
          display: grid;
          grid-template-columns: 200px repeat(3, 1fr);
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .spec-car-header {
          padding: 24px 20px;
          border-left: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          position: relative;
        }

        .spec-car-header.winner-col {
          background: rgba(245, 158, 11, 0.05);
          border-top: 2px solid #f59e0b;
        }

        .car-header-emoji { font-size: 32px; }
        .car-header-name { font-size: 15px; font-weight: 700; color: #fff; }
        .car-header-price { font-size: 18px; font-weight: 800; color: #f59e0b; }
        .car-score-badge {
          position: absolute;
          top: 10px; right: 10px;
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
          color: #f59e0b;
        }

        .spec-row {
          display: grid;
          grid-template-columns: 200px repeat(3, 1fr);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }

        .spec-row:last-child { border-bottom: none; }
        .spec-row:hover { background: rgba(255,255,255,0.02); }

        .spec-label-cell {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          border-right: 1px solid rgba(255,255,255,0.04);
        }

        .spec-icon { font-size: 16px; }

        .spec-value-cell {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          border-left: 1px solid rgba(255,255,255,0.04);
          text-align: center;
        }

        .spec-value-cell.winner-cell {
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .winner-crown {
          font-size: 14px;
          margin-left: 6px;
        }

        /* Features comparison */
        .features-grid {
          display: grid;
          grid-template-columns: 200px repeat(3, 1fr);
          gap: 0;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
        }

        .feature-row {
          display: contents;
        }

        .feature-label {
          padding: 14px 20px;
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
        }

        .feature-check {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          border-left: 1px solid rgba(255,255,255,0.04);
          font-size: 18px;
        }

        /* Pros/Cons */
        .pros-cons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .pros-cons-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
        }

        .pros-cons-car-name {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pros-section { margin-bottom: 16px; }

        .pros-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #22c55e;
          margin-bottom: 10px;
        }

        .cons-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #ef4444;
          margin-bottom: 10px;
        }

        .pro-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
        }

        .pro-item::before {
          content: '✓';
          color: #22c55e;
          font-weight: 700;
          flex-shrink: 0;
        }

        .con-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          margin-bottom: 6px;
        }

        .con-item::before {
          content: '✗';
          color: #ef4444;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Car picker modal */
        .car-picker {
          background: rgba(12, 12, 12, 0.98);
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 20px;
          padding: 24px;
          margin-top: 16px;
          animation: dropIn 0.2s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .picker-search {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .picker-search:focus {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(255,255,255,0.06);
        }

        .picker-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }

        .picker-car-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .picker-car-card:hover {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.25);
          transform: translateY(-2px);
        }

        .picker-car-emoji { font-size: 28px; margin-bottom: 8px; }
        .picker-car-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .picker-car-price { font-size: 14px; font-weight: 800; color: #f59e0b; }

        .col-empty {
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 1px solid rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.15);
          font-size: 24px;
        }

        @media (max-width: 900px) {
          .spec-table-header,
          .spec-row,
          .features-grid {
            grid-template-columns: 150px repeat(2, 1fr);
          }

          .spec-car-header:nth-child(4),
          .spec-value-cell:nth-child(4),
          .feature-check:nth-last-child(1) {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .compare-hero { padding: 40px 16px 24px; }
          .compare-container { padding: 0 16px 60px; }
          .spec-table-header,
          .spec-row {
            grid-template-columns: 130px repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="compare-root">
        {/* Hero */}
        <div className="compare-hero">
          <div className="compare-label">⚖️ Side-by-Side Comparison</div>
          <h1 className="compare-title">Compare <span>Cars</span><br />Like a Pro</h1>
          <p className="compare-sub">Select up to 3 cars and instantly compare specs, features, and value</p>
        </div>

        <div className="compare-container">
          {/* Selector bar */}
          <div className="selector-bar">
            {selected.map((car) => (
              <div key={car.id} className="selected-car-chip">
                <span style={{ fontSize: 18 }}>{car.emoji}</span>
                <div className="chip-dot" style={{ background: car.color }} />
                <span className="chip-name">{car.name}</span>
                <button className="chip-remove" onClick={() => removeCar(car.id)}>✕</button>
              </div>
            ))}
            {selected.length < MAX_COMPARE && (
              <button className="add-car-btn" onClick={() => {}}>
                + Add Car
              </button>
            )}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
              {selected.length}/{MAX_COMPARE} cars selected
            </span>
          </div>

          {/* Car picker */}
          {selected.length < MAX_COMPARE && (
            <div className="car-picker">
              <input
                className="picker-search"
                placeholder="🔍  Search cars to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="picker-grid">
                {filtered.map((car) => (
                  <div key={car.id} className="picker-car-card" onClick={() => addCar(car)}>
                    <div className="picker-car-emoji">{car.emoji}</div>
                    <div className="picker-car-name">{car.name}</div>
                    <div className="picker-car-price">{car.priceStr}</div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", color: "rgba(255,255,255,0.3)", padding: 20 }}>
                    No more cars to add
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Winner Banner */}
          {overallWinner && selected.length > 1 && (
            <div className="winner-banner">
              <div className="winner-trophy">🏆</div>
              <div>
                <div className="winner-text-title">
                  {overallWinner.emoji} {overallWinner.name} Wins!
                </div>
                <div className="winner-text-sub">
                  Best overall performance across all categories · {overallWinner.priceStr}
                </div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "center" }}>
                <div className="winner-score">{overallWinner.score}</div>
                <div className="winner-score-label">Expert Score</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="compare-tabs">
            {["specs", "features", "pros-cons"].map((t) => (
              <button
                key={t}
                className={`compare-tab ${activeTab === t ? "active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "specs" ? "📊 Specifications" : t === "features" ? "✨ Features" : "⚡ Pros & Cons"}
              </button>
            ))}
          </div>

          {/* Spec Table */}
          {activeTab === "specs" && (
            <div className="spec-table">
              <div className="spec-table-header">
                <div style={{ padding: "24px 20px", display: "flex", alignItems: "center" }}>
                  <span style={{ font: "700 11px 'DM Sans'", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)" }}>
                    Specification
                  </span>
                </div>
                {[0, 1, 2].map((i) =>
                  selected[i] ? (
                    <div key={selected[i].id} className={`spec-car-header ${overallWinner?.id === selected[i].id ? "winner-col" : ""}`}>
                      <div className="car-score-badge">{selected[i].score}</div>
                      <div className="car-header-emoji">{selected[i].emoji}</div>
                      <div className="car-header-name">{selected[i].name}</div>
                      <div className="car-header-price">{selected[i].priceStr}</div>
                    </div>
                  ) : (
                    <div key={`empty-${i}`} className="col-empty">—</div>
                  )
                )}
              </div>

              {SPEC_ROWS.map((row) => {
                const winnerId = getWinner(row.key);
                return (
                  <div key={row.key} className="spec-row">
                    <div className="spec-label-cell">
                      <span className="spec-icon">{row.icon}</span>
                      {row.label}
                    </div>
                    {[0, 1, 2].map((i) =>
                      selected[i] ? (
                        <div
                          key={selected[i].id}
                          className={`spec-value-cell ${winnerId === selected[i].id ? "winner-cell" : ""}`}
                        >
                          {row.format(selected[i][row.key])}
                          {winnerId === selected[i].id && <span className="winner-crown">👑</span>}
                        </div>
                      ) : (
                        <div key={`ev-${i}`} className="spec-value-cell" style={{ color: "rgba(255,255,255,0.1)" }}>—</div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Features */}
          {activeTab === "features" && (
            <div className="spec-table">
              <div className="spec-table-header">
                <div style={{ padding: "20px" }}>
                  <span style={{ font: "700 11px 'DM Sans'", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)" }}>Feature</span>
                </div>
                {[0, 1, 2].map((i) =>
                  selected[i] ? (
                    <div key={selected[i].id} className={`spec-car-header ${overallWinner?.id === selected[i].id ? "winner-col" : ""}`} style={{ padding: "16px 20px" }}>
                      <div className="car-header-emoji">{selected[i].emoji}</div>
                      <div className="car-header-name" style={{ fontSize: 13 }}>{selected[i].name}</div>
                    </div>
                  ) : (
                    <div key={`e-${i}`} className="col-empty">—</div>
                  )
                )}
              </div>

              {["Sunroof/Panoramic", "Airbags (6+)", "CarPlay/Android Auto", "360° Camera", "ADAS/Safety", "Wireless Charging", "Premium Audio", "Ventilated Seats"].map((feat) => (
                <div key={feat} className="spec-row">
                  <div className="spec-label-cell">{feat}</div>
                  {[0, 1, 2].map((i) =>
                    selected[i] ? (
                      <div key={selected[i].id} className="spec-value-cell">
                        {selected[i].features.some((f) => f.toLowerCase().includes(feat.split("/")[0].toLowerCase())) ? "✅" : "❌"}
                      </div>
                    ) : (
                      <div key={`ef-${i}`} className="spec-value-cell" style={{ color: "rgba(255,255,255,0.1)" }}>—</div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pros/Cons */}
          {activeTab === "pros-cons" && (
            <div className="pros-cons-grid">
              {selected.map((car) => (
                <div key={car.id} className="pros-cons-card">
                  <div className="pros-cons-car-name">
                    <span style={{ fontSize: 22 }}>{car.emoji}</span>
                    {car.name}
                    {overallWinner?.id === car.id && <span style={{ marginLeft: "auto", fontSize: 18 }}>🏆</span>}
                  </div>
                  <div className="pros-section">
                    <div className="pros-title">✓ Pros</div>
                    {car.pros.map((p) => (
                      <div key={p} className="pro-item">{p}</div>
                    ))}
                  </div>
                  <div>
                    <div className="cons-title">✗ Cons</div>
                    {car.cons.map((c) => (
                      <div key={c} className="con-item">{c}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Expert Score</span>
                    <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 20 }}>{car.score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}