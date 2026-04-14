import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllOrders, getMyOrders, getSellerOrders } from "../api";

export default function OrdersPage() {
  const { user } = useAuth();
  const role = String(user?.role || "buyer").toLowerCase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = role === "admin" ? await getAllOrders() : role === "seller" ? await getSellerOrders() : await getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [role]);

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", paddingTop: 90, padding: "90px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Orders</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: "#fff", marginBottom: 20 }}>Order History</h1>

        {loading && <div style={{ color: "rgba(255,255,255,.45)" }}>Loading orders...</div>}
        {error && <div style={{ color: "#f87171", marginBottom: 16 }}>{error}</div>}

        {!loading && orders.length === 0 && (
          <div style={{ padding: 32, border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, background: "rgba(255,255,255,.03)" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.5)" }}>No orders found.</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((order) => (
            <div key={order.id} style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 16, alignItems: "center", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 16 }}>
              <img src={order.image_url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80"} alt={order.car_title} style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 10 }} />
              <div>
                <h3 style={{ margin: "0 0 4px", color: "#fff", fontSize: 18 }}>{order.car_title}</h3>
                <p style={{ margin: 0, color: "rgba(255,255,255,.45)", fontSize: 13 }}>{order.brand} · {order.model || order.model_name} · Order {order.order_number}</p>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.35)", fontSize: 12 }}>
                  Status: {order.status} · Payment: {order.payment_status}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f59e0b", fontWeight: 800, fontSize: 18 }}>₹{Number(order.amount).toLocaleString("en-IN")}</div>
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: 12 }}>{order.currency || "INR"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
