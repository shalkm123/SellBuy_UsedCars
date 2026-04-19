import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { acceptBid, getSellerIncomingBids, rejectBid } from "../api";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function SellerBidsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bids, setBids] = useState([]);

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSellerIncomingBids();
      setBids(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (bid, action) => {
    try {
      if (action === "accept") await acceptBid(bid.car_id, bid.id);
      if (action === "reject") await rejectBid(bid.car_id, bid.id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bid");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="seller" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>Incoming Bids</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Accept or reject bids placed on your listings.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading bids...</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bids.map((bid) => (
            <div key={bid.id} style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#111", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{bid.bidder_name}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{bid.car_title}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f59e0b", fontWeight: 800 }}>{money(bid.bid_amount)}</div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{bid.status}</div>
                </div>
              </div>
              {bid.status === "PLACED" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => handleAction(bid, "accept")} style={btn("rgba(34,197,94,.14)", "#4ade80")}>Accept</button>
                  <button onClick={() => handleAction(bid, "reject")} style={btn("rgba(239,68,68,.14)", "#f87171")}>Reject</button>
                </div>
              )}
            </div>
          ))}
          {!loading && bids.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No bids found.</div>}
        </div>
      </main>
    </div>
  );
}

function btn(bg, color) {
  return {
    background: bg,
    color,
    border: `1px solid ${color}55`,
    borderRadius: 8,
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
  };
}
