import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getBuyerBids } from "../api";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const bidTone = (status) => {
  if (status === "ACCEPTED") return { color: "#4ade80", bg: "rgba(34,197,94,.14)" };
  if (status === "REJECTED") return { color: "#f87171", bg: "rgba(239,68,68,.14)" };
  if (status === "OUTBID") return { color: "#60a5fa", bg: "rgba(96,165,250,.14)" };
  return { color: "#f59e0b", bg: "rgba(245,158,11,.14)" };
};

export default function BuyerBidsPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bids, setBids] = useState([]);

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBuyerBids();
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="buyer" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>My Bids</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Track every bid and whether you are still leading.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading bids...</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bids.map((bid) => {
            const tone = bidTone(bid.status);
            return (
              <article key={bid.id} style={{ border: "1px solid rgba(255,255,255,.1)", background: "#111", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 12, alignItems: "center" }}>
                  <img
                    src={bid.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"}
                    alt={bid.car_title}
                    style={{ width: 84, height: 64, borderRadius: 10, objectFit: "cover", cursor: "pointer" }}
                    onClick={() => navigate(`/car/${bid.car_id}`)}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", cursor: "pointer" }} onClick={() => navigate(`/car/${bid.car_id}`)}>{bid.car_title}</div>
                    <div style={{ color: "rgba(255,255,255,.58)", fontSize: 12 }}>{bid.brand} · {bid.model} · {bid.city}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 10, fontSize: 12 }}>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>Your Bid: {money(bid.bid_amount)}</span>
                      <span style={{ color: "rgba(255,255,255,.5)" }}>Highest: {money(bid.highest_bid)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", padding: "5px 10px", borderRadius: 999, color: tone.color, background: tone.bg, fontSize: 11, fontWeight: 700 }}>
                      {bid.status}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: bid.is_highest_bid ? "#4ade80" : "rgba(255,255,255,.45)" }}>
                      {bid.is_highest_bid ? "Leading" : "Not leading"}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && bids.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No bids found.</div>}
        </div>
      </main>
    </div>
  );
}
