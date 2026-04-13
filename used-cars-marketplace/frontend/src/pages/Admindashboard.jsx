import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { mockAdminStats, mockPendingListings, mockRevenueData } from "../data/mockData";

const CSS = `
@keyframes ad-up   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes ad-pulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
.ad-a1{animation:ad-up .4s .04s both} .ad-a2{animation:ad-up .4s .09s both}
.ad-a3{animation:ad-up .4s .14s both} .ad-a4{animation:ad-up .4s .19s both}
.ad-a5{animation:ad-up .4s .24s both} .ad-a6{animation:ad-up .4s .29s both}
.ad-stat{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px 18px;position:relative;overflow:hidden;transition:all .2s;cursor:default;}
.ad-stat:hover{border-color:rgba(245,158,11,.25);transform:translateY(-2px);}
.ad-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;}
.ad-approval-row{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.05);transition:all .18s;background:rgba(255,255,255,.02);}
.ad-approval-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);}
.ad-approval-flagged{background:rgba(239,68,68,.04)!important;border-color:rgba(239,68,68,.15)!important;}
.ad-fraud-row{padding:14px;border-radius:12px;border:1px solid;transition:all .2s;}
.ad-fraud-high{background:rgba(239,68,68,.06);border-color:rgba(239,68,68,.2);}
.ad-fraud-med{background:rgba(245,158,11,.06);border-color:rgba(245,158,11,.2);}
.ad-fraud-low{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.07);}
.ad-btn{display:flex;align-items:center;justify-content:center;gap:5px;padding:7px 14px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer;border:none;transition:all .18s;letter-spacing:.2px;white-space:nowrap;}
.ad-tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.3px;}
.ad-section-title{font-size:15px;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.ad-live-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:ad-pulse 2s infinite;display:inline-block;margin-right:6px;}
`;

const MAX_REV = Math.max(...mockRevenueData.map(d => d.revenue));

const FRAUD_ALERTS = [
  { listing: "2017 Honda Civic Si",   seller: "anon_seller",  reason: "Price 60% below market value", severity: "high" },
  { listing: "2020 BMW 3 Series",     seller: "testuser99",   reason: "Duplicate listing detected",   severity: "high" },
  { listing: "2019 Audi A4 Premium",  seller: "quicksale22",  reason: "Unverified documents uploaded", severity: "medium" },
  { listing: "2021 Swift ZXI Plus",   seller: "ram_cars_del", reason: "Multiple IP flag",              severity: "low" },
];

const SEVERITY = {
  high:   { label: "HIGH", color: "#f87171", bg: "rgba(239,68,68,.15)" },
  medium: { label: "MED",  color: "#F59E0B", bg: "rgba(245,158,11,.15)" },
  low:    { label: "LOW",  color: "#6b7280", bg: "rgba(107,114,128,.15)" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(mockPendingListings);
  const [alerts,  setAlerts]  = useState(FRAUD_ALERTS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainMargin = sidebarCollapsed ? 72 : 260;

  const handleApprove = (id) => setPending(p => p.filter(x => x.id !== id));
  const handleReject  = (id) => setPending(p => p.filter(x => x.id !== id));
  const dismissAlert  = (i)  => setAlerts(a => a.filter((_, j) => j !== i));

  const STATS = [
    { label: "Total Users",       value: mockAdminStats.totalUsers.toLocaleString(), icon: "👥", color: "#60a5fa", bg: "rgba(96,165,250,.12)" },
    { label: "Total Listings",    value: mockAdminStats.totalListings,               icon: "🚗", color: "#a78bfa", bg: "rgba(167,139,250,.12)" },
    { label: "Pending Approvals", value: pending.length,                             icon: "🛡️", color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
    { label: "Revenue",           value: `₹${(mockAdminStats.totalRevenue/1000).toFixed(0)}K`, icon: "💹", color: "#4ade80", bg: "rgba(74,222,128,.12)" },
    { label: "Fraud Alerts",      value: alerts.length,                              icon: "⚠️", color: "#f87171", bg: "rgba(239,68,68,.12)" },
    { label: "Active Bids",       value: mockAdminStats.activeBids,                  icon: "⚡", color: "#f472b6", bg: "rgba(244,114,182,.12)" },
  ];

  return (
    <>
      <style>{CSS}</style>
      {/* ✅ FIX: paddingTop: "70px" so content clears the fixed navbar */}
      <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "sans-serif", paddingTop: "70px" }}>
        <Sidebar role="admin" onToggle={setSidebarCollapsed} />

        <main style={{ flex: 1, marginLeft: mainMargin, padding: "36px 32px", overflowY: "auto", minWidth: 0, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>

          {/* Header */}
          <div className="ad-a1" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgba(239,68,68,.8)", marginBottom: 6 }}>Admin Control Center</p>
              <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                Platform <span style={{ color: "#F59E0B" }}>Overview</span>
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="ad-live-dot" />
                Live monitoring · Last updated just now
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ padding: "10px 18px", borderRadius: 10, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.25)", color: "#f87171", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                ⚠️ {alerts.length} Alerts
              </button>
              <button style={{ padding: "10px 18px", borderRadius: 10, background: "#F59E0B", border: "none", color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                📤 Export Report
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="ad-a2" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
            {STATS.map(({ label, value, icon, color, bg }) => (
              <div key={label} className="ad-stat">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 5, lineHeight: 1.3 }}>{label}</div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, opacity: 0.7 }} />
              </div>
            ))}
          </div>

          {/* Row 1: Chart + Fraud */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Revenue Chart */}
            <div className="ad-card ad-a3">
              <div className="ad-section-title">
                📈 Revenue Overview
                <div style={{ display: "flex", gap: 8 }}>
                  {["7D","30D","90D"].map((t, i) => (
                    <button key={t} style={{ padding: "4px 10px", borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: "pointer", background: i === 1 ? "rgba(245,158,11,.15)" : "rgba(255,255,255,.04)", border: i === 1 ? "1px solid rgba(245,158,11,.3)" : "1px solid rgba(255,255,255,.07)", color: i === 1 ? "#F59E0B" : "rgba(255,255,255,.4)" }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 150, padding: "0 4px" }}>
                {mockRevenueData.map((d, i) => {
                  const h = Math.round((d.revenue / MAX_REV) * 130);
                  const isL = i === mockRevenueData.length - 1;
                  return (
                    <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      {isL && <span style={{ fontSize: 9, color: "rgba(245,158,11,.8)", fontWeight: 700 }}>₹{(d.revenue/1000).toFixed(0)}K</span>}
                      {!isL && <span style={{ fontSize: 9, color: "transparent" }}>·</span>}
                      <div style={{ width: "100%", height: h, background: isL ? "#F59E0B" : "rgba(245,158,11,.2)", borderRadius: "6px 6px 0 0", cursor: "pointer", transition: "background .2s" }}
                        onMouseEnter={e => { if (!isL) e.currentTarget.style.background = "rgba(245,158,11,.35)"; }}
                        onMouseLeave={e => { if (!isL) e.currentTarget.style.background = "rgba(245,158,11,.2)"; }}
                        title={`${d.month}: ₹${d.revenue.toLocaleString()}`}
                      />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,.35)", fontWeight: 500 }}>{d.month}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                {[
                  { label: "Monthly Avg", val: "₹23.8K", trend: "+12%", up: true },
                  { label: "Peak Month",  val: "₹31.2K", trend: "Dec",  up: true },
                  { label: "YoY Growth",  val: "+34%",   trend: "vs 2023", up: true },
                ].map(({ label, val, trend, up }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "4px 0 2px" }}>{val}</p>
                    <p style={{ fontSize: 10, color: up ? "#4ade80" : "#f87171" }}>{trend}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fraud Alerts */}
            <div className="ad-card ad-a4">
              <div className="ad-section-title">
                ⚠️ Fraud Alerts
                <span className="ad-tag" style={{ background: "rgba(239,68,68,.15)", color: "#f87171" }}>{alerts.length} active</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,.3)", fontSize: 13 }}>✅ No active alerts</div>
                ) : alerts.map((alert, i) => {
                  const sev = SEVERITY[alert.severity];
                  return (
                    <div key={i} className={`ad-fraud-row ad-fraud-${alert.severity}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span className="ad-tag" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{alert.listing}</span>
                          </div>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>by @{alert.seller}</p>
                          <p style={{ fontSize: 11, color: sev.color, marginTop: 4 }}>⚠ {alert.reason}</p>
                        </div>
                        <button onClick={() => dismissAlert(i)} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 7, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,.4)", fontSize: 12, flexShrink: 0 }}>✕</button>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="ad-btn" style={{ flex: 1, background: "rgba(239,68,68,.12)", color: "#f87171", border: "1px solid rgba(239,68,68,.2)" }}>🚫 Remove Listing</button>
                        <button className="ad-btn" style={{ background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.08)" }}>View</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="ad-card ad-a5">
            <div className="ad-section-title">
              🛡️ Pending Approvals
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="ad-tag" style={{ background: "rgba(245,158,11,.15)", color: "#F59E0B" }}>{pending.length} waiting</span>
                <button style={{ fontSize: 11, background: "none", border: "none", color: "rgba(245,158,11,.7)", cursor: "pointer", fontWeight: 600 }}>View All →</button>
              </div>
            </div>
            {pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,.3)", fontSize: 13 }}>🎉 All caught up! No pending approvals.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map((listing) => (
                  <div key={listing.id} className={`ad-approval-row ${listing.flagged ? "ad-approval-flagged" : ""}`}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: listing.flagged ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                      {listing.flagged ? "🚩" : "🚗"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.title}</p>
                        {listing.flagged && <span className="ad-tag" style={{ background: "rgba(239,68,68,.15)", color: "#f87171", flexShrink: 0 }}>⚠ Flagged</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>by {listing.seller}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>₹{listing.price.toLocaleString()}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{listing.submittedAt}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <div style={{ width: 80, height: 4, background: "rgba(255,255,255,.06)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 100, width: `${listing.trustScore}%`, background: listing.trustScore >= 80 ? "#4ade80" : listing.trustScore >= 60 ? "#F59E0B" : "#f87171" }} />
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>{listing.trustScore}% trust</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="ad-btn" onClick={() => handleApprove(listing.id)} style={{ background: "rgba(34,197,94,.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,.25)" }}>✓ Approve</button>
                      <button className="ad-btn" onClick={() => handleReject(listing.id)}  style={{ background: "rgba(239,68,68,.12)", color: "#f87171", border: "1px solid rgba(239,68,68,.25)" }}>✕ Reject</button>
                      <button className="ad-btn" style={{ background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.4)", border: "1px solid rgba(255,255,255,.08)" }}>👁 Review</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <div className="ad-card ad-a6">
              <div className="ad-section-title">👥 User Activity</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "New Registrations Today", value: 23,  max: 50,  color: "#60a5fa" },
                  { label: "Active Sessions",          value: 187, max: 300, color: "#4ade80" },
                  { label: "Listings Created Today",   value: 14,  max: 30,  color: "#F59E0B" },
                  { label: "Transactions Completed",   value: 8,   max: 20,  color: "#a78bfa" },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "rgba(255,255,255,.4)" }}>{label}</span>
                      <span style={{ fontWeight: 700, color: "#fff" }}>{value}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,.06)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(value/max)*100}%`, background: color, borderRadius: 100 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ad-card ad-a6">
              <div className="ad-section-title">⚡ Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Broadcast Alert", icon: "📢", color: "rgba(239,68,68,.12)", border: "rgba(239,68,68,.2)", text: "#f87171" },
                  { label: "Export Users",    icon: "📤", color: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.2)", text: "#60a5fa" },
                  { label: "System Settings", icon: "⚙️", color: "rgba(167,139,250,.12)", border: "rgba(167,139,250,.2)", text: "#a78bfa" },
                  { label: "View Full Logs",  icon: "📋", color: "rgba(74,222,128,.12)", border: "rgba(74,222,128,.2)", text: "#4ade80" },
                  { label: "Manage Roles",    icon: "🛡️", color: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.2)", text: "#F59E0B" },
                  { label: "Backup Data",     icon: "💾", color: "rgba(244,114,182,.12)", border: "rgba(244,114,182,.2)", text: "#f472b6" },
                ].map(({ label, icon, color, border, text }) => (
                  <button key={label} style={{ padding: "14px 12px", borderRadius: 12, background: color, border: `1px solid ${border}`, color: text, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .18s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >
                    <span style={{ fontSize: 18 }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}