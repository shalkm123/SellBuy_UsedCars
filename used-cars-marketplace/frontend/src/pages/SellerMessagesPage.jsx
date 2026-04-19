import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getSellerMessages, updateInquiryStatus } from "../api";

export default function SellerMessagesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSellerMessages();
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await updateInquiryStatus(id, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update message status");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="seller" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>Messages</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Buyer inquiries on your listings.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading messages...</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg) => (
            <article key={msg.id} style={{ border: "1px solid rgba(255,255,255,.1)", background: "#111", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{msg.buyer_name}</div>
                  <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{msg.car_title}</div>
                </div>
                <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{msg.status}</div>
              </div>
              <div style={{ color: "rgba(255,255,255,.86)", marginBottom: 10 }}>{msg.message}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setStatus(msg.id, "open")} style={btn("rgba(245,158,11,.14)", "#f59e0b")}>Mark Open</button>
                <button onClick={() => setStatus(msg.id, "replied")} style={btn("rgba(34,197,94,.14)", "#4ade80")}>Mark Replied</button>
                <button onClick={() => setStatus(msg.id, "closed")} style={btn("rgba(96,165,250,.14)", "#60a5fa")}>Close</button>
              </div>
            </article>
          ))}
          {!loading && messages.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No inquiries yet.</div>}
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
