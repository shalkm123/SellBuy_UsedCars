import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getBuyerMessages } from "../api";

const statusStyle = (status) => {
  const key = String(status || "").toLowerCase();
  if (key === "replied") return { color: "#4ade80", background: "rgba(34,197,94,.14)", border: "1px solid rgba(34,197,94,.35)" };
  if (key === "closed") return { color: "#60a5fa", background: "rgba(96,165,250,.14)", border: "1px solid rgba(96,165,250,.35)" };
  return { color: "#f59e0b", background: "rgba(245,158,11,.14)", border: "1px solid rgba(245,158,11,.35)" };
};

export default function BuyerMessagesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);

  const mainMargin = sidebarCollapsed ? 72 : 260;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBuyerMessages();
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080808", color: "#fff", paddingTop: 70, fontFamily: "DM Sans, sans-serif" }}>
      <Sidebar role="buyer" onToggle={setSidebarCollapsed} />
      <main style={{ flex: 1, marginLeft: mainMargin, transition: "margin-left .3s ease", padding: "30px 24px" }}>
        <h1 style={{ marginTop: 0 }}>Messages</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginTop: -6 }}>Your inquiries and seller responses on cars you contacted.</p>

        {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
        {loading && <div style={{ color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Loading messages...</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map((msg) => (
            <article key={msg.id} style={{ border: "1px solid rgba(255,255,255,.1)", background: "#111", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 12, alignItems: "center" }}>
                <img
                  src={msg.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80"}
                  alt={msg.car_title}
                  style={{ width: 84, height: 64, borderRadius: 10, objectFit: "cover" }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: "#fff" }}>{msg.car_title}</div>
                  <div style={{ color: "rgba(255,255,255,.58)", fontSize: 12 }}>{msg.brand} · {msg.model}</div>
                  <div style={{ color: "rgba(255,255,255,.48)", fontSize: 12, marginTop: 4 }}>Seller: {msg.seller_name}</div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "5px 10px", ...statusStyle(msg.status) }}>
                  {String(msg.status || "open").toUpperCase()}
                </div>
              </div>
              <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,.86)", lineHeight: 1.5 }}>{msg.message}</p>
            </article>
          ))}
          {!loading && messages.length === 0 && <div style={{ color: "rgba(255,255,255,0.6)" }}>No messages yet.</div>}
        </div>
      </main>
    </div>
  );
}
