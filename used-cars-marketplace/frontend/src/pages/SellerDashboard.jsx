import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  acceptBid,
  getSellerAnalytics,
  getSellerDashboard,
  getSellerIncomingBids,
  rejectBid,
} from "../api";
import { useAuth } from "../context/AuthContext";

const money = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({ listings: [], counts: {}, total_earnings: 0 });
  const [analytics, setAnalytics] = useState({ summary: {}, monthly_revenue: [] });
  const [bids, setBids] = useState([]);

  const firstName = (user?.full_name || user?.name || "Seller").split(" ")[0];
  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, analyticsRes, bidsRes] = await Promise.all([
        getSellerDashboard(),
        getSellerAnalytics(),
        getSellerIncomingBids(),
      ]);
      setDashboard(dashboardRes.data || { listings: [], counts: {}, total_earnings: 0 });
      setAnalytics(analyticsRes.data || { summary: {}, monthly_revenue: [] });
      setBids(Array.isArray(bidsRes.data) ? bidsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statCards = useMemo(() => {
    const summary = analytics.summary || {};
    return [
      { label: "Active Listings", value: Number(dashboard.counts?.active || 0) },
      { label: "Total Inquiries", value: Number(summary.total_inquiries || 0) },
      { label: "Open Bids", value: Number(summary.open_bids || 0) },
      { label: "Total Revenue", value: money(summary.total_revenue || dashboard.total_earnings || 0) },
    ];
  }, [analytics.summary, dashboard.counts, dashboard.total_earnings]);

  const recentListings = (dashboard.listings || []).slice(0, 5);
  const recentBids = bids.slice(0, 6);

  const handleBidAction = async (bid, action) => {
    try {
      if (action === "accept") await acceptBid(bid.car_id, bid.id);
      if (action === "reject") await rejectBid(bid.car_id, bid.id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update bid");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "DM Sans, sans-serif", paddingTop: 70 }}>
      <Sidebar role="seller" onToggle={setSidebarCollapsed} />

      <main style={{ flex: 1, marginLeft: mainMargin, padding: "30px 24px", transition: "margin-left 0.3s ease", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ color: "#f59e0b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 6 }}>Seller Hub</p>
            <h1 style={{ margin: 0, fontSize: 34 }}>
              {firstName}&apos;s Dashboard
            </h1>
          </div>
          <button
            onClick={() => navigate("/add-listing")}
            style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}
          >
            + New Listing
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 10, padding: 12, marginBottom: 14 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>Loading dashboard...</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
          {statCards.map((card) => (
            <div key={card.label} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <section style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>My Listings</h2>
              <button onClick={() => navigate("/my-listings")} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer" }}>View all</button>
            </div>

            {recentListings.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No listings yet.</div>}
            {recentListings.map((listing) => (
              <div key={listing.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{listing.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                  {listing.location_city || listing.city || "NA"} | {listing.status}
                </div>
                <div style={{ color: "#f59e0b", fontWeight: 700, marginTop: 4 }}>{money(listing.price)}</div>
              </div>
            ))}

            <h3 style={{ marginTop: 18, marginBottom: 10, fontSize: 16 }}>Revenue (Last 6 months)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(40px, 1fr))", gap: 8 }}>
              {(analytics.monthly_revenue || []).map((row) => (
                <div key={row.month} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{row.month}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginTop: 2 }}>{money(row.revenue)}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Incoming Bids</h2>
              <button onClick={() => navigate("/bids")} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer" }}>Manage</button>
            </div>

            {recentBids.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No bids available.</div>}
            {recentBids.map((bid) => (
              <div key={bid.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{bid.bidder_name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bid.car_title}</div>
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: 700 }}>{money(bid.bid_amount)}</div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>{bid.status}</div>
                {bid.status === "PLACED" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleBidAction(bid, "accept")} style={{ flex: 1, background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>Accept</button>
                    <button onClick={() => handleBidAction(bid, "reject")} style={{ flex: 1, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
