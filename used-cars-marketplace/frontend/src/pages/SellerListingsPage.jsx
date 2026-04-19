import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { deleteCar, getMyListings, updateSellerListingStatus } from "../api";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function SellerListingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyListings();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await updateSellerListingStatus(id, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing status");
    }
  };

  const removeListing = async (id) => {
    try {
      await deleteCar(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete listing");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="seller" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>My Listings</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Manage status and visibility for all your car listings.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)" }}>Loading listings...</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          {items.map((item) => (
            <article key={item.id} style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#111", borderRadius: 12, padding: 14 }}>
              <h3 style={{ margin: 0, marginBottom: 6 }}>{item.title}</h3>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                {item.location_city || item.city || "NA"} | {item.manufacturing_year || item.year}
              </div>
              <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>{money(item.price)}</div>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                Status: <strong>{item.status}</strong>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setStatus(item.id, "ACTIVE")} style={btn("rgba(34,197,94,.14)", "#4ade80")}>Activate</button>
                <button onClick={() => setStatus(item.id, "INACTIVE")} style={btn("rgba(245,158,11,.14)", "#f59e0b")}>Pause</button>
                <button onClick={() => setStatus(item.id, "UNDER_REVIEW")} style={btn("rgba(96,165,250,.14)", "#60a5fa")}>Review</button>
                <button onClick={() => removeListing(item.id)} style={btn("rgba(239,68,68,.14)", "#f87171")}>Delete</button>
              </div>
            </article>
          ))}
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
