import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getBuyerOffers } from "../api";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const statusChip = (status) => {
  if (status === "ACCEPTED") return { label: "Accepted", color: "#4ade80", bg: "rgba(34,197,94,.14)" };
  if (status === "REJECTED") return { label: "Rejected", color: "#f87171", bg: "rgba(239,68,68,.14)" };
  if (status === "OUTBID") return { label: "Outbid", color: "#60a5fa", bg: "rgba(96,165,250,.14)" };
  return { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,.14)" };
};

export default function BuyerOffersPage() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ summary: { total: 0, active: 0, accepted: 0, rejected: 0, outbid: 0 }, offers: [] });

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBuyerOffers();
      setData({
        summary: {
          total: Number(res.data?.summary?.total || 0),
          active: Number(res.data?.summary?.active || 0),
          accepted: Number(res.data?.summary?.accepted || 0),
          rejected: Number(res.data?.summary?.rejected || 0),
          outbid: Number(res.data?.summary?.outbid || 0),
        },
        offers: Array.isArray(res.data?.offers) ? res.data.offers : [],
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load offers");
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
        <h1 style={{ marginTop: 0 }}>My Offers</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Offers you have placed across listings and their latest outcome.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10, margin: "16px 0 20px" }}>
          <Stat label="Total" value={data.summary.total} />
          <Stat label="Pending" value={data.summary.active} />
          <Stat label="Accepted" value={data.summary.accepted} />
          <Stat label="Rejected" value={data.summary.rejected} />
          <Stat label="Outbid" value={data.summary.outbid} />
        </div>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading offers...</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.offers.map((offer) => {
            const chip = statusChip(offer.status);
            return (
              <article key={offer.id} style={{ border: "1px solid rgba(255,255,255,.1)", background: "#111", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 12, alignItems: "center" }}>
                  <img
                    src={offer.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"}
                    alt={offer.car_title}
                    style={{ width: 84, height: 64, borderRadius: 10, objectFit: "cover", cursor: "pointer" }}
                    onClick={() => navigate(`/car/${offer.car_id}`)}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "#fff", cursor: "pointer" }} onClick={() => navigate(`/car/${offer.car_id}`)}>{offer.car_title}</div>
                    <div style={{ color: "rgba(255,255,255,.58)", fontSize: 12 }}>{offer.brand} · {offer.model} · {offer.city}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 10, fontSize: 12 }}>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>Offer: {money(offer.bid_amount)}</span>
                      <span style={{ color: "rgba(255,255,255,.5)" }}>Listed: {money(offer.listed_price)}</span>
                    </div>
                  </div>
                  <div style={{ display: "inline-flex", padding: "5px 10px", borderRadius: 999, color: chip.color, background: chip.bg, fontSize: 11, fontWeight: 700 }}>
                    {chip.label}
                  </div>
                </div>
              </article>
            );
          })}
          {!loading && data.offers.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No offers found.</div>}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, background: "#111", padding: "10px 12px" }}>
      <div style={{ color: "rgba(255,255,255,.5)", fontSize: 11 }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{value}</div>
    </div>
  );
}
