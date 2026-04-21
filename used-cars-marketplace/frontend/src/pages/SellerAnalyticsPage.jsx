import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getSellerAnalytics } from "../api";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function SellerAnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ summary: {}, monthly_revenue: [] });

  const mainMargin = sidebarCollapsed ? 72 : 260;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getSellerAnalytics();
        setData(res.data || { summary: {}, monthly_revenue: [] });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const s = data.summary || {};

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="seller" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>Analytics</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Performance trends across listings, bids, inquiries, and revenue.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading analytics...</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
          <Card title="Total Listings" value={s.total_listings || 0} />
          <Card title="Sold Listings" value={s.sold_listings || 0} />
          <Card title="Inquiries" value={s.total_inquiries || 0} />
          <Card title="Total Bids" value={s.total_bids || 0} />
          <Card title="Bid Conversion" value={`${s.bid_conversion_rate || 0}%`} />
          <Card title="Revenue" value={money(s.total_revenue || 0)} />
        </div>

        <section style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 14 }}>
          <h2 style={{ margin: 0, marginBottom: 10, fontSize: 18 }}>Monthly Revenue</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8 }}>
            {(data.monthly_revenue || []).map((row) => (
              <div key={row.month} style={{ border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{row.month}</div>
                <div style={{ fontWeight: 700, color: "#f59e0b", marginTop: 4 }}>{money(row.revenue)}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: "#111", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 14 }}>
      <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}
