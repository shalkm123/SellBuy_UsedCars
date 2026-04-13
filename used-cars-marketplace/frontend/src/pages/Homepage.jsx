import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { mockCars as cars } from "../data/mockData";

const STATS = [
  { value: "12,400+", label: "Cars Listed" },
  { value: "8,200+", label: "Happy Buyers" },
  { value: "98%", label: "Verified Sellers" },
  { value: "₹0", label: "Hidden Fees" },
];

const FEATURES = [
  { icon: "🛡️", title: "AI Trust Score", desc: "Every car gets a verified trust rating based on 40+ data points." },
  { icon: "🤖", title: "Smart Chatbot", desc: "Describe your dream car in plain English — our AI finds the match." },
  { icon: "⚡", title: "Live Bidding", desc: "Place bids in real time and get notified instantly on acceptance." },
  { icon: "📊", title: "EMI Calculator", desc: "Simulate loan plans with live interest rates before you commit." },
  { icon: "🔍", title: "Side-by-Side Compare", desc: "Line up 3 cars together with AI-powered verdict on best value." },
  { icon: "🔒", title: "Secure Payments", desc: "Razorpay-integrated checkout with escrow protection built in." },
];

const TESTIMONIALS = [
  { name: "Rahul Mehta", city: "Mumbai", text: "Found my dream Swift in 20 minutes. The trust score saved me from a sketchy deal.", avatar: "RM", rating: 5 },
  { name: "Priya Sharma", city: "Bangalore", text: "Sold my Creta in 3 days. The seller dashboard is incredibly smooth.", avatar: "PS", rating: 5 },
  { name: "Arjun Singh", city: "Delhi", text: "The EMI calculator and compare tool helped me make the right choice.", avatar: "AS", rating: 5 },
];

function StatCounter({ value, label }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDisplay(value); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.8rem", fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", lineHeight: 1, letterSpacing: "0.05em", transition: "all 0.8s ease" }}>{display}</div>
      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export default function Homepage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredCars = cars.slice(0, 6);

  return (
    <div style={{ background: "#080808", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 2px; }
        @keyframes heroFloat { 0%,100%{transform:translateY(0px) scale(1.05)} 50%{transform:translateY(-12px) scale(1.06)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine { 0%{transform:translateY(-100%);opacity:0.6} 100%{transform:translateY(800%);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes orb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.1)} 66%{transform:translate(-20px,30px) scale(0.9)} }
        .hero-card { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1) !important; }
        .hero-card:hover { transform: translateY(-8px) !important; }
        .search-btn:hover { background: #d97706 !important; transform: scale(1.02); }
        .nav-link:hover { color: #f59e0b !important; }
        .feat-card { transition: all 0.3s ease; }
        .feat-card:hover { border-color: #f59e0b !important; background: rgba(245,158,11,0.05) !important; }
        .cta-btn { transition: all 0.3s ease; }
        .cta-btn:hover { background: #d97706 !important; transform: translateY(-2px); box-shadow: 0 20px 60px rgba(245,158,11,0.4) !important; }
        .ghost-btn { transition: all 0.3s ease; }
        .ghost-btn:hover { background: rgba(245,158,11,0.1) !important; color: #f59e0b !important; }
        .car-img:hover { transform: scale(1.05) !important; }
      `}</style>

      {/* HERO */}
      <section style={{ position: "relative", height: "100vh", minHeight: "700px", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80)", backgroundSize: "cover", backgroundPosition: "center", transform: `scale(1.1) translateY(${scrollY * 0.15}px)`, transition: "transform 0.1s ease", animation: "heroFloat 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(8,8,8,0.95) 40%, rgba(8,8,8,0.6) 70%, rgba(8,8,8,0.3) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,158,11,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#f59e0b,transparent)", animation: "scanLine 6s linear infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "15%", width: "400px", height: "400px", background: "radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%)", animation: "orb 10s ease-in-out infinite", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "0 2rem", width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "100px", padding: "6px 16px", marginBottom: "1.5rem", animation: "fadeUp 0.6s ease both" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite", display: "block" }} />
            <span style={{ color: "#f59e0b", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500 }}>India's Smartest Car Marketplace</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(4rem,9vw,8rem)", lineHeight: 0.9, letterSpacing: "0.02em", color: "#fff", marginBottom: "1.5rem", animation: "fadeUp 0.8s 0.1s ease both" }}>
            FIND YOUR<br />
            <span style={{ color: "#f59e0b", textShadow: "0 0 60px rgba(245,158,11,0.5)" }}>PERFECT DRIVE</span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#9ca3af", maxWidth: "520px", lineHeight: 1.7, marginBottom: "2.5rem", animation: "fadeUp 0.8s 0.2s ease both", fontWeight: 300 }}>
            Browse 12,000+ verified used cars. AI-powered trust scores, live bidding, instant EMI — everything you need to buy or sell with confidence.
          </p>

          <div style={{ display: "flex", gap: "0", maxWidth: "560px", animation: "fadeUp 0.8s 0.3s ease both", marginBottom: "2rem" }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/browse?q=${searchQuery}`)}
              placeholder="Search by brand, model, city..."
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(245,158,11,0.3)", borderRight: "none", borderRadius: "6px 0 0 6px", padding: "1rem 1.25rem", color: "#e5e7eb", fontSize: "0.95rem", outline: "none", backdropFilter: "blur(10px)" }}
            />
            <button className="search-btn" onClick={() => navigate(`/browse?q=${searchQuery}`)} style={{ background: "#f59e0b", border: "none", borderRadius: "0 6px 6px 0", padding: "1rem 1.75rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", cursor: "pointer" }}>
              SEARCH
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", animation: "fadeUp 0.8s 0.4s ease both" }}>
            {["Under ₹5L", "SUVs", "Automatic", "Delhi", "Mumbai"].map((tag) => (
              <button key={tag} className="ghost-btn" onClick={() => navigate(`/browse?q=${tag}`)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", padding: "6px 16px", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer" }}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", animation: "pulse 2s infinite" }}>
          <span style={{ fontSize: "0.7rem", color: "#6b7280", letterSpacing: "0.2em", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom,#f59e0b,transparent)" }} />
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: "1px solid rgba(245,158,11,0.15)", borderBottom: "1px solid rgba(245,158,11,0.15)", background: "rgba(245,158,11,0.02)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem" }}>
          {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
        </div>
      </section>

      {/* FEATURED CARS */}
      <section style={{ padding: "6rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
          <div>
            <p style={{ color: "#f59e0b", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Hand-picked for you</p>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.5rem,5vw,4rem)", letterSpacing: "0.03em", color: "#fff", lineHeight: 1 }}>FEATURED CARS</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate("/browse")} style={{ background: "transparent", border: "1px solid rgba(245,158,11,0.4)", borderRadius: "6px", padding: "0.6rem 1.5rem", color: "#f59e0b", fontSize: "0.85rem", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Bebas Neue', cursive" }}>
            VIEW ALL →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "1.5rem" }}>
          {featuredCars.map((car, i) => (
            <div key={car.id} className="hero-card" onClick={() => navigate(`/car/${car.id}`)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden", cursor: "pointer", animation: `fadeUp 0.6s ${i * 0.08}s ease both` }}>
              <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                <img
                  src={car.image || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"}
                  alt={car.title}
                  className="car-img"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                />
                <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.8)", border: "1px solid rgba(245,158,11,0.5)", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600, backdropFilter: "blur(8px)" }}>
                  ★ {car.trustScore}
                </div>
                {car.verified && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: "100px", padding: "3px 10px", fontSize: "0.7rem", color: "#10b981", letterSpacing: "0.05em" }}>
                    ✓ VERIFIED
                  </div>
                )}
                {/* Price tag badge */}
                <div style={{ position: "absolute", bottom: "12px", left: "12px", background: car.priceTag === "Great Deal" ? "rgba(16,185,129,0.85)" : car.priceTag === "Good Deal" ? "rgba(59,130,246,0.85)" : "rgba(245,158,11,0.85)", borderRadius: "100px", padding: "3px 10px", fontSize: "0.7rem", color: "#fff", fontWeight: 700, backdropFilter: "blur(8px)" }}>
                  {car.priceTag}
                </div>
              </div>

              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.05em", color: "#fff", lineHeight: 1.2, flex: 1, marginRight: 8 }}>
                    {car.title}
                  </h3>
                  <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", flexShrink: 0 }}>
                    ₹{(car.price / 100000).toFixed(1)}L
                  </span>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.78rem", color: "#6b7280", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <span>📍 {car.city}</span>
                  <span>🛣 {car.km.toLocaleString()} km</span>
                  <span>⚙️ {car.transmission}</span>
                  <span>⛽ {car.fuel}</span>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/car/${car.id}`); }}
                    style={{ flex: 1, background: "#f59e0b", border: "none", borderRadius: "6px", padding: "0.6rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.08em", cursor: "pointer" }}>
                    VIEW DETAILS
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    style={{ padding: "0.6rem 1rem", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#9ca3af", cursor: "pointer", fontSize: "1rem", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#9ca3af"; }}>
                    ♡
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "6rem 2rem", background: "linear-gradient(180deg,transparent,rgba(245,158,11,0.03),transparent)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{ color: "#f59e0b", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Why AutoBazaar</p>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#fff", letterSpacing: "0.03em" }}>BUILT DIFFERENT</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="feat-card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.75rem", animation: `fadeUp 0.6s ${i * 0.1}s ease both` }}>
                <div style={{ width: "48px", height: "48px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: "1rem" }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.05em", color: "#fff", marginBottom: "0.5rem" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "0.88rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ color: "#f59e0b", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Real Stories</p>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(2.5rem,5vw,4rem)", color: "#fff", letterSpacing: "0.03em" }}>TRUSTED BY THOUSANDS</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "1.75rem", animation: `fadeUp 0.6s ${i * 0.1}s ease both` }}>
                <div style={{ color: "#f59e0b", fontSize: "1rem", marginBottom: "1rem" }}>{"★".repeat(t.rating)}</div>
                <p style={{ color: "#d1d5db", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700, fontSize: "0.8rem" }}>{t.avatar}</div>
                  <div>
                    <div style={{ color: "#fff", fontSize: "0.88rem", fontWeight: 600 }}>{t.name}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.78rem" }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "6rem 2rem", background: "linear-gradient(135deg,rgba(245,158,11,0.08) 0%,transparent 60%)", borderTop: "1px solid rgba(245,158,11,0.15)", borderBottom: "1px solid rgba(245,158,11,0.15)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "600px", height: "600px", background: "radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(3rem,7vw,6rem)", letterSpacing: "0.03em", color: "#fff", lineHeight: 1, marginBottom: "1.5rem" }}>
            READY TO FIND<br /><span style={{ color: "#f59e0b" }}>YOUR CAR?</span>
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: "450px", margin: "0 auto 2.5rem" }}>
            Join 8,200+ buyers who've found their perfect drive on AutoBazaar.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button className="cta-btn" onClick={() => navigate("/browse")} style={{ background: "#f59e0b", border: "none", borderRadius: "8px", padding: "1rem 2.5rem", color: "#000", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 10px 40px rgba(245,158,11,0.3)" }}>
              BROWSE CARS →
            </button>
            <button className="ghost-btn" onClick={() => navigate("/add-listing")} style={{ background: "transparent", border: "1px solid rgba(245,158,11,0.4)", borderRadius: "8px", padding: "1rem 2.5rem", color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em", cursor: "pointer" }}>
              SELL YOUR CAR
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "3rem 2rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.1em", color: "#fff" }}>
          AUTO<span style={{ color: "#f59e0b" }}>BAZAAR</span>
        </div>
        <p style={{ color: "#4b5563", fontSize: "0.8rem" }}>© 2025 AutoBazaar. Built for India's car enthusiasts.</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {[
            { label: "Browse", path: "/browse" },
            { label: "Sell", path: "/add-listing" },
            { label: "Compare", path: "/compare" },
            { label: "EMI Calculator", path: "/emi" },
          ].map(({ label, path }) => (
            <button key={label} className="nav-link" onClick={() => navigate(path)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.82rem", cursor: "pointer", transition: "color 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}