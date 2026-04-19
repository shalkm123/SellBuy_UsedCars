import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { getAllCars, getBuyerBids, getBuyerDashboard, getBuyerNavStats, getBuyerOffers, getMyWishlist } from "../api";

const CSS = `
@keyframes bd-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes bd-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
@keyframes bd-bar { from{width:0} to{width:var(--w)} }
.bd-a1{animation:bd-up .4s .05s both} .bd-a2{animation:bd-up .4s .10s both}
.bd-a3{animation:bd-up .4s .15s both} .bd-a4{animation:bd-up .4s .20s both}
.bd-a5{animation:bd-up .4s .25s both} .bd-a6{animation:bd-up .4s .30s both}
.bd-stat {
  background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;
  padding:22px 20px;position:relative;overflow:hidden;transition:border-color .2s;cursor:default;
}
.bd-stat:hover{border-color:rgba(245,158,11,.25);}
.bd-stat::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.02),transparent);pointer-events:none;}
.bd-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;}
.bd-car-row{display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:12px;cursor:pointer;transition:all .18s;}
.bd-car-row:hover{background:rgba(245,158,11,.06);border-color:rgba(245,158,11,.2);}
.bd-img{width:60px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;}
.bd-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;}
.bd-action{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 0;border-radius:12px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);color:rgba(255,255,255,.5);transition:all .18s;text-decoration:none;}
.bd-action:hover{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.3);color:#F59E0B;}
.bd-section-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.bd-see-all{font-size:11px;color:rgba(245,158,11,.7);cursor:pointer;background:none;border:none;font-weight:600;}
.bd-see-all:hover{color:#F59E0B;}
`;

const BID_STATUS = {
  PLACED: { bg: "rgba(245,158,11,.15)", color: "#F59E0B", label: "Pending" },
  OUTBID: { bg: "rgba(59,130,246,.15)", color: "#60a5fa", label: "Outbid" },
  ACCEPTED: { bg: "rgba(34,197,94,.15)", color: "#4ade80", label: "Accepted" },
  REJECTED: { bg: "rgba(239,68,68,.15)", color: "#f87171", label: "Rejected" },
};

const formatPrice = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({ purchases: [], inquiries: [] });
  const [wishlist, setWishlist] = useState([]);
  const [bids, setBids] = useState([]);
  const [offers, setOffers] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [navStats, setNavStats] = useState({ wishlist_items: 0, active_bids: 0, open_messages: 0 });

  const mainMargin = sidebarCollapsed ? 72 : 260;
  const firstName = (user?.full_name || user?.name || "Buyer").split(" ")[0];

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, wishlistRes, bidsRes, offersRes, navStatsRes, carsRes] = await Promise.all([
        getBuyerDashboard(),
        getMyWishlist(),
        getBuyerBids(),
        getBuyerOffers(),
        getBuyerNavStats(),
        getAllCars({ status: "ACTIVE" }),
      ]);

      const wishlistItems = Array.isArray(wishlistRes.data?.items) ? wishlistRes.data.items : [];
      const bidRows = Array.isArray(bidsRes.data) ? bidsRes.data : [];
      const offerRows = Array.isArray(offersRes.data?.offers) ? offersRes.data.offers : [];
      const allCars = Array.isArray(carsRes.data) ? carsRes.data : [];

      setDashboard({
        purchases: Array.isArray(dashboardRes.data?.purchases) ? dashboardRes.data.purchases : [],
        inquiries: Array.isArray(dashboardRes.data?.inquiries) ? dashboardRes.data.inquiries : [],
      });
      setWishlist(wishlistItems);
      setBids(bidRows);
      setOffers(offerRows);
      setNavStats({
        wishlist_items: Number(navStatsRes.data?.wishlist_items || 0),
        active_bids: Number(navStatsRes.data?.active_bids || 0),
        open_messages: Number(navStatsRes.data?.open_messages || 0),
      });

      const hidden = new Set(wishlistItems.map((item) => Number(item.id)));
      setRecommended(allCars.filter((item) => !hidden.has(Number(item.id))).slice(0, 2));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const engagementScore = useMemo(() => {
    const value = 40 + (wishlist.length * 5) + (navStats.active_bids * 8) + (dashboard.inquiries.length * 4);
    return Math.max(0, Math.min(100, value));
  }, [wishlist.length, navStats.active_bids, dashboard.inquiries.length]);

  const STATS = [
    { label: "Saved Cars", value: navStats.wishlist_items, icon: "❤️", color: "#ef4444", bg: "rgba(239,68,68,.12)" },
    { label: "Active Bids", value: navStats.active_bids, icon: "⚡", color: "#F59E0B", bg: "rgba(245,158,11,.12)" },
    { label: "Open Messages", value: navStats.open_messages, icon: "💬", color: "#60a5fa", bg: "rgba(96,165,250,.12)" },
    { label: "Purchases", value: dashboard.purchases.length, icon: "✅", color: "#4ade80", bg: "rgba(74,222,128,.12)" },
  ];

  const QUICK = [
    { label: "Browse Cars",    icon: "🚗", to: "/browse" },
    { label: "AI Advisor",     icon: "🤖", to: "/chatbot" },
    { label: "Compare Cars",   icon: "⚖️", to: "/compare" },
    { label: "EMI Calculator", icon: "💰", to: "/emi" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "#080808", fontFamily: "sans-serif", paddingTop: "70px" }}>
        <Sidebar role="buyer" onToggle={setSidebarCollapsed} />

        <main style={{ flex: 1, marginLeft: mainMargin, padding: "36px 32px", overflowY: "auto", minWidth: 0, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
          {error && <div style={{ marginBottom: 14, color: "#f87171" }}>{error}</div>}
          {loading && <div style={{ marginBottom: 14, color: "rgba(255,255,255,.45)" }}>Loading dashboard...</div>}

          {/* Header */}
          <div className="bd-a1" style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgba(245,158,11,.7)", marginBottom: 6 }}>Buyer Portal</p>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                  Hey, <span style={{ color: "#F59E0B" }}>{firstName}</span> 👋
                </h1>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.35)", marginTop: 6 }}>Here's what's happening with your car search today.</p>
              </div>
              <button onClick={() => navigate("/browse")} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F59E0B", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,.3)", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(245,158,11,.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,.3)"; }}
              >
                🔍 Browse Cars
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bd-a2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
            {STATS.map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bd-stat">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginTop: 6 }}>{label}</div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: "0 0 16px 16px", opacity: 0.6 }} />
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

            {/* Active Bids */}
            <div className="bd-card bd-a3">
              <div className="bd-section-title">
                ⚡ Active Bids
                <button className="bd-see-all">View All →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {bids.slice(0, 4).map((bid) => {
                  const st = BID_STATUS[bid.status] || BID_STATUS.PLACED;
                  return (
                    <div key={bid.id} className="bd-car-row" onClick={() => navigate(`/car/${bid.car_id}`)}>
                      <img className="bd-img" src={bid.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"} alt="" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bid.car_title}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>₹{Number(bid.bid_amount || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className="bd-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  );
                })}
                {!loading && bids.length === 0 && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>No active bids yet.</div>}
              </div>
            </div>

            {/* Wishlist */}
            <div className="bd-card bd-a4">
              <div className="bd-section-title">
                ❤️ Wishlist
                <button className="bd-see-all">View All →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {wishlist.slice(0, 4).map((car) => (
                  <div key={car.id} className="bd-car-row" onClick={() => navigate(`/car/${car.id}`)}>
                    <img className="bd-img" src={car.image} alt="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{car.title}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2 }}>{car.city} · {car.year} · {car.km.toLocaleString()} km</p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B", flexShrink: 0 }}>{formatPrice(car.price)}</span>
                  </div>
                ))}
                {!loading && wishlist.length === 0 && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Your wishlist is empty.</div>}
              </div>
            </div>

            {/* My Offers */}
            <div className="bd-card bd-a5">
              <div className="bd-section-title">📋 My Offers</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {offers.slice(0, 4).map((offer) => (
                  <div key={offer.id} className="bd-car-row">
                    <img className="bd-img" src={offer.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"} alt="" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{offer.car_title}</p>
                      <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 2 }}>Offered: ₹{Number(offer.bid_amount || 0).toLocaleString()}</p>
                    </div>
                    <span className="bd-badge" style={offer.status === "ACCEPTED"
                      ? { background: "rgba(34,197,94,.15)", color: "#4ade80" }
                      : { background: "rgba(245,158,11,.15)", color: "#F59E0B" }}>
                      {offer.status === "ACCEPTED" ? "✓ Accepted" : "⏳ Pending"}
                    </span>
                  </div>
                ))}
                {!loading && offers.length === 0 && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>No offers yet.</div>}
              </div>

              {/* Recommended */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.35)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>🔥 Recommended For You</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {recommended.map((car) => (
                    <div key={car.id} onClick={() => navigate(`/car/${car.id}`)} style={{ flex: 1, background: "rgba(255,255,255,.03)", borderRadius: 10, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(255,255,255,.05)", transition: "all .18s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,158,11,.25)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.05)"}
                    >
                      <img src={car.image} alt="" style={{ width: "100%", height: 70, objectFit: "cover" }} />
                      <div style={{ padding: "8px 10px" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{car.title}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginTop: 2 }}>{formatPrice(car.price)}</p>
                      </div>
                    </div>
                  ))}
                  {!loading && recommended.length === 0 && <div style={{ color: "rgba(255,255,255,.5)", fontSize: 13 }}>Browse more cars to get recommendations.</div>}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bd-card bd-a6">
              <div className="bd-section-title">⚡ Quick Actions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {QUICK.map(({ label, icon, to }) => (
                  <a key={label} href={to} className="bd-action" onClick={(e) => { e.preventDefault(); navigate(to); }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span>{label}</span>
                  </a>
                ))}
              </div>

              {/* AI tip */}
              <div style={{ background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.15)", borderRadius: 12, padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>AI Insight</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "bd-pulse 2s infinite", marginLeft: 4 }} />
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
                  {wishlist[0]
                    ? <>Your top saved car is <strong style={{ color: "rgba(255,255,255,.8)" }}>{wishlist[0].title}</strong>. You can compare it with similar listings before placing your next offer.</>
                    : <>Save cars to your wishlist so the AI advisor can suggest better alternatives and bidding strategies.</>}
                </p>
                <button onClick={() => navigate("/chatbot")} style={{ marginTop: 10, background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 600, color: "#F59E0B", cursor: "pointer" }}>
                  Ask AI Advisor →
                </button>
              </div>

              {/* Trust score */}
              <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: 0.5 }}>Buyer Engagement Score</p>
                  <p style={{ fontSize: 22, fontWeight: 900, color: "#4ade80", marginTop: 2 }}>{engagementScore}%</p>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `conic-gradient(#4ade80 ${Math.round((engagementScore / 100) * 360)}deg, rgba(255,255,255,.08) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
