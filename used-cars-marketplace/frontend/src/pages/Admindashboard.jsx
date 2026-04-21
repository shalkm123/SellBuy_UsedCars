import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getAdminApprovals,
  getAdminFraudAlerts,
  getAdminListingsPage,
  getAdminMessages,
  getAdminRevenue,
  getAdminUsersPage,
} from "../api";

const cardStyle = {
  background: "#111",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: 16,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainMargin = sidebarCollapsed ? 72 : 260;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [approvals, setApprovals] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [revenue, setRevenue] = useState({ summary: {}, monthly: [] });
  const [usersData, setUsersData] = useState({ counts: {}, users: [] });

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [approvalsRes, fraudRes, listingsRes, messagesRes, revenueRes, usersRes] = await Promise.all([
        getAdminApprovals(),
        getAdminFraudAlerts(),
        getAdminListingsPage(),
        getAdminMessages(),
        getAdminRevenue(),
        getAdminUsersPage(),
      ]);

      setApprovals(approvalsRes.data || []);
      setFraudAlerts(fraudRes.data || []);
      setListings(listingsRes.data || []);
      setMessages(messagesRes.data || []);
      setRevenue(revenueRes.data || { summary: {}, monthly: [] });
      setUsersData(usersRes.data || { counts: {}, users: [] });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = Number(revenue?.summary?.total_revenue || 0);
    return [
      { label: "Total Users", value: Number(usersData?.counts?.total || 0).toLocaleString("en-IN"), to: "/admin/users" },
      { label: "Total Listings", value: Number(listings.length || 0).toLocaleString("en-IN"), to: "/admin/listings" },
      { label: "Pending Approvals", value: approvals.length, to: "/approvals" },
      { label: "Revenue", value: `Rs ${totalRevenue.toLocaleString("en-IN")}`, to: "/admin/revenue" },
      { label: "Fraud Alerts", value: fraudAlerts.length, to: "/fraud" },
      { label: "Messages", value: messages.length, to: "/messages" },
    ];
  }, [usersData, listings, approvals, revenue, fraudAlerts, messages]);

  const recentApprovals = approvals.slice(0, 5);
  const recentFraud = fraudAlerts.slice(0, 5);
  const monthly = (revenue?.monthly || []).slice(0, 6).reverse();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'DM Sans', sans-serif", paddingTop: "70px" }}>
      <Sidebar role="admin" onToggle={setSidebarCollapsed} />

      <main style={{ flex: 1, marginLeft: mainMargin, padding: "36px 32px", transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, color: "#f59e0b", marginBottom: 6, fontWeight: 700 }}>
              Admin Control Center
            </p>
            <h1 style={{ fontSize: 36, lineHeight: 1.1, margin: 0 }}>
              Platform <span style={{ color: "#f59e0b" }}>Overview</span>
            </h1>
          </div>

          <button onClick={loadOverview} style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
            Refresh
          </button>
        </div>

        {error && <div style={{ marginBottom: 14, color: "#f87171" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => navigate(stat.to)}
              style={{ ...cardStyle, textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>{loading ? "..." : stat.value}</div>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Revenue Trend</div>
              <button onClick={() => navigate("/admin/revenue")} style={{ background: "transparent", color: "#f59e0b", border: "none", cursor: "pointer" }}>View Revenue</button>
            </div>

            {monthly.length === 0 ? (
              <div style={{ color: "#9ca3af" }}>{loading ? "Loading..." : "No revenue data available."}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${monthly.length}, minmax(0, 1fr))`, gap: 8, alignItems: "end", height: 160 }}>
                {monthly.map((m) => {
                  const maxRevenue = Math.max(...monthly.map((x) => Number(x.revenue || 0)), 1);
                  const h = Math.max(16, Math.round((Number(m.revenue || 0) / maxRevenue) * 120));
                  return (
                    <div key={m.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", height: h, borderRadius: "8px 8px 0 0", background: "rgba(245,158,11,0.35)" }} title={`Rs ${Number(m.revenue || 0).toLocaleString("en-IN")}`} />
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Fraud Alerts</div>
              <button onClick={() => navigate("/fraud")} style={{ background: "transparent", color: "#f59e0b", border: "none", cursor: "pointer" }}>Open Alerts</button>
            </div>

            {recentFraud.length === 0 ? (
              <div style={{ color: "#9ca3af" }}>{loading ? "Loading..." : "No active alerts."}</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {recentFraud.map((row) => (
                  <div key={row.id} style={{ border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: 10, background: "rgba(239,68,68,0.08)" }}>
                    <div style={{ fontWeight: 700, marginBottom: 3 }}>{row.listing?.title}</div>
                    <div style={{ color: "#fca5a5", fontSize: 12 }}>
                      {row.severity} | {row.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pending Approvals Snapshot</div>
            <button onClick={() => navigate("/approvals")} style={{ background: "transparent", color: "#f59e0b", border: "none", cursor: "pointer" }}>Go to Approvals</button>
          </div>

          {recentApprovals.length === 0 ? (
            <div style={{ color: "#9ca3af" }}>{loading ? "Loading..." : "No listing waiting for approval."}</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {recentApprovals.map((item) => (
                <div key={item.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 10, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    <div style={{ color: "#9ca3af", fontSize: 13 }}>{item.seller_name} | {item.location_city}, {item.location_state}</div>
                  </div>
                  <div style={{ color: "#f59e0b", fontWeight: 700 }}>Rs {Number(item.price || 0).toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
