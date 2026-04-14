import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { mockSellerListings, mockBids, formatPrice, mockRevenueData } from "../data/mockData";

const CSS = `
@keyframes sd-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes sd-bar-grow { from{width:0} to{width:var(--tw)} }
.sd-a1{animation:sd-up .4s .05s both} .sd-a2{animation:sd-up .4s .10s both}
.sd-a3{animation:sd-up .4s .15s both} .sd-a4{animation:sd-up .4s .20s both}
.sd-a5{animation:sd-up .4s .25s both} .sd-a6{animation:sd-up .4s .30s both}
.sd-stat{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px 20px;position:relative;overflow:hidden;transition:border-color .2s;}
.sd-stat:hover{border-color:rgba(245,158,11,.25);}
.sd-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;}
.sd-row{display:flex;align-items:center;gap:14px;padding:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;transition:all .18s;}
.sd-row:hover{background:rgba(245,158,11,.04);border-color:rgba(245,158,11,.15);}
.sd-img{width:72px;height:50px;border-radius:9px;object-fit:cover;flex-shrink:0;}
.sd-bid-row{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:14px;transition:border-color .18s;}
.sd-bid-row:hover{border-color:rgba(245,158,11,.2);}
.sd-btn{display:flex;align-items:center;justify-content:center;gap:5px;flex:1;padding:8px 0;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer;border:none;transition:all .18s;letter-spacing:.3px;}
.sd-chart-bar{border-radius:6px 6px 0 0;transition:opacity .2s;cursor:pointer;position:relative;}
.sd-chart-bar:hover{opacity:.8;}
.sd-perf-bar{height:6px;border-radius:100px;background:rgba(255,255,255,.07);}
.sd-perf-fill{height:100%;border-radius:100px;animation:sd-bar-grow .8s ease both;}
.sd-section-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;}
.sd-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.4px;}
`;

const MONTHS = mockRevenueData.map(d => d.month);
const REVENUES = mockRevenueData.map(d => d.revenue);
const MAX_REV = Math.max(...REVENUES);

const INCOMING_BIDS = [
  { buyer: "Aryan K.", amount: 580000, car: "Swift VXI 2021",  time: "2 min ago",  status: "new" },
  { buyer: "Meera S.", amount: 570000, car: "Swift VXI 2021",  time: "18 min ago", status: "new" },
  { buyer: "Dev R.",   amount: 1400000, car: "Nexon EV Prime", time: "1 hr ago",   status: "seen" },
  { buyer: "Priya M.", amount: 1380000, car: "Nexon EV Prime", time: "3 hr ago",   status: "seen" },
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState(INCOMING_BIDS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainMargin = sidebarCollapsed ? 72 : 260;
  const firstName = (user?.full_name || user?.name || "Seller").split(" ")[0];

  const STATS = [
    { label: "Active Listings", value: "2",   icon: "🚗", color: "#60a5fa", bg: "rgba(96,165,250,.12)" },
    { label: "Total Views",     value: "421", icon: "👁️", color: "#a78bfa", bg: "rgba(167,139,250,.12)" },
    { label: "Inquiries",       value: "20",  icon: "💬", color: "#4ade80", bg: "rgba(74,222,128,.12)" },
    { label: "Pending Bids",    value: String(bids.filter(b => b.status === "new").length), icon: "⚡", color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
  ];

  const handleBid = (idx, action) => {
    setBids((prev) => prev.map((b, i) => i === idx ? { ...b, status: action } : b));
  };

  const PERF = [
    { label: "Profile Views (this week)", value: 87,  max: 200, color: "#60a5fa" },
    { label: "Wishlist Saves",            value: 23,  max: 50,  color: "#f472b6" },
    { label: "Bid Conversion Rate",       value: 65,  max: 100, color: "#F59E0B" },
    { label: "Seller Trust Score",        value: 92,  max: 100, color: "#4ade80" },
  ];

  return (
    <>
      <style>{CSS}</style>
      {/* ✅ FIX: paddingTop: "70px" so content clears the fixed navbar */}
      <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "sans-serif", paddingTop: "70px" }}>
        <Sidebar role="seller" onToggle={setSidebarCollapsed} />

        <main style={{ flex: 1, marginLeft: mainMargin, padding: "36px 32px", overflowY: "auto", minWidth: 0, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>

          {/* Header */}
          <div className="sd-a1" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgba(245,158,11,.7)", marginBottom: 6 }}>Seller Hub</p>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                <span style={{ color: "#F59E0B" }}>{firstName}'s</span> Dashboard
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 6 }}>Manage your listings and track performance.</p>
            </div>
            <button onClick={() => navigate("/add-listing")} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F59E0B", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,.3)", transition: "all .2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(245,158,11,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,.3)"; }}
            >
              ＋ New Listing
            </button>
          </div>

          {/* Stats */}
          <div className="sd-a2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
            {STATS.map(({ label, value, icon, color, bg }) => (
              <div key={label} className="sd-stat">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>{label}</div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: 0.7 }} />
              </div>
            ))}
          </div>

          {/* My Listings */}
          <div className="sd-card sd-a3" style={{ marginBottom: 20 }}>
            <div className="sd-section-title">
              🚗 My Listings
              <button style={{ fontSize: 11, color: "rgba(245,158,11,.7)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Manage All →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mockSellerListings.map((listing) => (
                <div key={listing.id} className="sd-row">
                  <img className="sd-img" src={listing.image} alt="" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.title}</p>
                    <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
                      {[
                        { icon: "👁️", val: `${listing.views} views` },
                        { icon: "💬", val: `${listing.inquiries} inquiries` },
                        { icon: "⚡", val: `${listing.bids} bids` },
                      ].map(({ icon, val }) => (
                        <span key={val} style={{ fontSize: 11, color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center", gap: 4 }}>{icon} {val}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,.06)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((listing.views / 300) * 100, 100)}%`, background: "linear-gradient(90deg, #F59E0B, #fbbf24)", borderRadius: 100 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{formatPrice(listing.price)}</div>
                    <span className="sd-tag" style={{ background: "rgba(34,197,94,.12)", color: "#4ade80", marginTop: 4 }}>● Active</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                    <button style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(96,165,250,.1)", border: "1px solid rgba(96,165,250,.2)", color: "#60a5fa", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                    <button style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Pause</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Revenue Chart */}
              <div className="sd-card sd-a4">
                <div className="sd-section-title">📈 Revenue Overview</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, padding: "0 4px" }}>
                  {mockRevenueData.map((d, i) => {
                    const h = Math.round((d.revenue / MAX_REV) * 120);
                    const isLast = i === mockRevenueData.length - 1;
                    return (
                      <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,.3)", opacity: isLast ? 1 : 0 }}>{isLast ? `₹${(d.revenue/1000).toFixed(0)}K` : ""}</span>
                        <div className="sd-chart-bar" title={`₹${d.revenue.toLocaleString()}`}
                          style={{ width: "100%", height: h, background: isLast ? "#F59E0B" : "rgba(245,158,11,.25)" }}>
                          {isLast && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(245,158,11,.3),transparent)", borderRadius: "6px 6px 0 0" }} />}
                        </div>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 500 }}>{d.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  {[
                    { label: "This Month", val: "₹24.5K", up: true },
                    { label: "Total Earned", val: "₹1.44L", up: true },
                    { label: "Avg per Sale", val: "₹8.2K", up: false },
                  ].map(({ label, val, up }) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>{val} <span style={{ fontSize: 11, color: up ? "#4ade80" : "#f87171" }}>{up ? "↑" : "↓"}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div className="sd-card sd-a5">
                <div className="sd-section-title">🎯 Performance</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {PERF.map(({ label, value, max, color }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: "rgba(255,255,255,.45)" }}>{label}</span>
                        <span style={{ fontWeight: 700, color: "#fff" }}>{value}{max === 100 ? "%" : ""}</span>
                      </div>
                      <div className="sd-perf-bar">
                        <div className="sd-perf-fill" style={{ "--tw": `${(value / max) * 100}%`, width: `${(value / max) * 100}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Incoming Bids */}
            <div className="sd-card sd-a6">
              <div className="sd-section-title">
                ⚡ Incoming Bids
                <span style={{ fontSize: 11, background: "rgba(245,158,11,.15)", color: "#F59E0B", padding: "3px 10px", borderRadius: 100, fontWeight: 700 }}>
                  {bids.filter(b => b.status === "new").length} new
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bids.map((bid, i) => (
                  <div key={i} className="sd-bid-row" style={{ opacity: ["accepted","rejected"].includes(bid.status) ? 0.5 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{bid.buyer}</span>
                          {bid.status === "new" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />}
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>on {bid.car}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#F59E0B" }}>₹{bid.amount.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{bid.time}</div>
                      </div>
                    </div>
                    {["accepted","rejected","countered"].includes(bid.status) ? (
                      <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, padding: "6px", borderRadius: 8,
                        background: bid.status === "accepted" ? "rgba(34,197,94,.1)" : bid.status === "rejected" ? "rgba(239,68,68,.1)" : "rgba(96,165,250,.1)",
                        color: bid.status === "accepted" ? "#4ade80" : bid.status === "rejected" ? "#f87171" : "#60a5fa"
                      }}>
                        {bid.status === "accepted" ? "✓ Accepted" : bid.status === "rejected" ? "✗ Rejected" : "⟳ Counter Sent"}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="sd-btn" onClick={() => handleBid(i, "accepted")} style={{ background: "rgba(34,197,94,.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,.2)" }}>✓ Accept</button>
                        <button className="sd-btn" onClick={() => handleBid(i, "countered")} style={{ background: "rgba(96,165,250,.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,.2)" }}>⟳ Counter</button>
                        <button className="sd-btn" onClick={() => handleBid(i, "rejected")} style={{ background: "rgba(239,68,68,.12)", color: "#f87171", border: "1px solid rgba(239,68,68,.2)" }}>✗ Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}