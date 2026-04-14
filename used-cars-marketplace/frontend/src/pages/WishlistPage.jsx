import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyWishlist, removeWishlistItem } from "../api";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyWishlist();
      setItems(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (carId) => {
    try {
      await removeWishlistItem(carId);
      await loadWishlist();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", paddingTop: 90, padding: "90px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <p style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Saved Cars</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: "#fff" }}>Wishlist</h1>
          </div>
          <button onClick={() => navigate("/browse")} style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 700, cursor: "pointer" }}>
            Browse Cars
          </button>
        </div>

        {loading && <div style={{ color: "rgba(255,255,255,.45)" }}>Loading wishlist...</div>}
        {error && <div style={{ color: "#f87171", marginBottom: 16 }}>{error}</div>}

        {!loading && items.length === 0 && (
          <div style={{ padding: 32, border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, background: "rgba(255,255,255,.03)" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.5)" }}>Your wishlist is empty.</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {items.map((car) => (
            <div key={car.id} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
              <img src={car.image || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"} alt={car.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 6px", fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "#fff" }}>{car.title}</h3>
                <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,.45)", fontSize: 13 }}>{car.city} · {car.year} · {Number(car.km || car.km_driven || 0).toLocaleString()} km</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>₹{Number(car.price).toLocaleString("en-IN")}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => navigate(`/car/${car.id}`)} style={{ background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.25)", color: "#f59e0b", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>View</button>
                    <button onClick={() => handleRemove(car.id)} style={{ background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
