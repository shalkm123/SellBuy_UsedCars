import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCars as cars } from "../data/mockData"; // fixed: was { cars }
import { useAuth } from "../context/AuthContext";
import {
  acceptBid,
  addCompareItem,
  addWishlistItem,
  getBidsByCar,
  getCarById,
  getMyCompareList,
  getMyWishlist,
  placeBid,
  recomputeTrustScore,
  removeCompareItem,
  removeWishlistItem,
  rejectBid,
  updateBiddingConfig,
} from "../api";

const GALLERY_FALLBACKS = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  "https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
];

const SPECS_MAP = [
  { icon: "📅", label: "Year", key: "year", fallback: "2021" },
  { icon: "🛣", label: "Kilometers", key: "km", fallback: "45,000 km" },
  { icon: "⛽", label: "Fuel Type", key: "fuel", fallback: "Petrol" },       // fixed: was "fuelType"
  { icon: "⚙️", label: "Transmission", key: "transmission", fallback: "Manual" },
  { icon: "🎨", label: "Color", key: "color", fallback: "White" },
  { icon: "💺", label: "Owners", key: "owners", fallback: "1st Owner" },
  { icon: "🏷️", label: "Insurance", key: "insurance", fallback: "Valid" },
  { icon: "📋", label: "RC Status", key: "rcStatus", fallback: "Clear" },
];

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveCar, setLiveCar] = useState(null);
  const car = liveCar || cars.find((c) => String(c.id) === String(id)) || cars[0];
  const [loading, setLoading] = useState(true);

  const [activeImg, setActiveImg] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidInfo, setBidInfo] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [wishlisted, setWishlisted] = useState(false);
  const [inCompare, setInCompare] = useState(false);
  const [bidsData, setBidsData] = useState({ config: null, bids: [] });

  const role = String(user?.role || "").toLowerCase();
  const isSellerView = role === "seller" || role === "admin";
  const isBuyerView = role === "buyer" || role === "admin";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCarById(id);
        setLiveCar(res.data);
      } catch {
        setLiveCar(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadBids = async () => {
    if (!user) return;
    try {
      const res = await getBidsByCar(id);
      setBidsData(res.data || { config: null, bids: [] });
    } catch {
      setBidsData({ config: null, bids: [] });
    }
  };

  useEffect(() => {
    loadBids();
  }, [id, user]);

  useEffect(() => {
    const hydrateActions = async () => {
      if (!user) {
        const localCompare = JSON.parse(localStorage.getItem("compare_ids") || "[]").map(String);
        setWishlisted(false);
        setInCompare(localCompare.includes(String(id)));
        return;
      }

      if (String(user.role || "").toLowerCase() === "buyer") {
        try {
          const res = await getMyWishlist();
          const ids = (res.data?.items || []).map((item) => String(item.id));
          setWishlisted(ids.includes(String(id)));
        } catch {
          setWishlisted(false);
        }
      } else {
        setWishlisted(false);
      }

      try {
        const res = await getMyCompareList();
        const ids = (res.data?.items || []).map((item) => String(item.id));
        setInCompare(ids.includes(String(id)));
      } catch {
        const localCompare = JSON.parse(localStorage.getItem("compare_ids") || "[]").map(String);
        setInCompare(localCompare.includes(String(id)));
      }
    };

    hydrateActions();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (String(user?.role || "").toLowerCase() !== "buyer") {
      navigate("/login");
      return;
    }
    const next = !wishlisted;
    setWishlisted(next);
    try {
      if (next) await addWishlistItem({ car_id: id });
      else await removeWishlistItem(id);
    } catch {
      setWishlisted(!next);
    }
  };

  const handleCompareToggle = async () => {
    const localCompare = JSON.parse(localStorage.getItem("compare_ids") || "[]").map(String);
    const exists = localCompare.includes(String(id));
    const next = exists
      ? localCompare.filter((item) => item !== String(id))
      : localCompare.length < 3
        ? [...localCompare, String(id)]
        : localCompare;

    localStorage.setItem("compare_ids", JSON.stringify(next));
    setInCompare(next.includes(String(id)));

    if (!user) {
      navigate(`/compare?ids=${next.join(",")}`);
      return;
    }

    try {
      if (exists) await removeCompareItem(id);
      else if (next.length !== localCompare.length) await addCompareItem(id);
    } catch {
      localStorage.setItem("compare_ids", JSON.stringify(localCompare));
      setInCompare(localCompare.includes(String(id)));
    }
  };

  const images = car.images?.length
    ? car.images.map((image) => image.image_url || image)
    : [car.image, ...GALLERY_FALLBACKS.slice(1)].filter(Boolean);
  const similarCars = cars.filter((c) => c.id !== car.id).slice(0, 3);

  const emiMonthly = Math.round(Number(car.emiQuote?.monthly_emi || (car.price * 0.85 * 0.009 * Math.pow(1.009, 60)) / (Math.pow(1.009, 60) - 1)));

  const handleBid = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) return;

    setBidError("");
    try {
      const bidAmountInRupees = Math.round(Number(bidAmount) * 100000);
      const res = await placeBid(id, { bid_amount: bidAmountInRupees });
      setBidInfo(res.data?.message || "Bid placed successfully");
      setBidSubmitted(true);
      setBidAmount("");
      await loadBids();
      setTimeout(() => setBidSubmitted(false), 3000);
    } catch (error) {
      setBidError(error?.response?.data?.message || "Could not place bid");
    }
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await acceptBid(id, bidId);
      await loadBids();
    } catch (error) {
      setBidError(error?.response?.data?.message || "Could not accept bid");
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      await rejectBid(id, bidId);
      await loadBids();
    } catch (error) {
      setBidError(error?.response?.data?.message || "Could not reject bid");
    }
  };

  const handleEnableBidding = async () => {
    try {
      const end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await updateBiddingConfig(id, { is_enabled: true, min_increment: 5000, end_time: end });
      await loadBids();
    } catch (error) {
      setBidError(error?.response?.data?.message || "Could not enable bidding");
    }
  };

  const trustColor = (score) => {
    if (score == null || Number.isNaN(Number(score))) return "#6b7280";
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ background: "#080808", color: "#e5e7eb", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", paddingTop: "70px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .thumb:hover { border-color: #f59e0b !important; }
        .tab-btn:hover { color: #f59e0b !important; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(245,158,11,0.3); }
        .action-btn { transition: all 0.2s ease; }
        .similar-card:hover { border-color: rgba(245,158,11,0.4) !important; transform: translateY(-4px); }
        .similar-card { transition: all 0.3s ease; }
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,8,8,0.92)", color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.08em" }}>
          Loading car details...
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "1rem 2rem",
        display: "flex", alignItems: "center", gap: "0.5rem",
        fontSize: "0.82rem", color: "#6b7280",
        background: "rgba(8,8,8,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50
      }}>
              <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em" }}>
         
        </button>
        <span></span>
        <button onClick={() => navigate("/browse")} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>Browse</button>
        <span></span>
        <span style={{ color: "#e5e7eb" }}>{car.title}</span>   {/* fixed: was car.name */}
      </div>

      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "2rem", display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Gallery */}
          <div style={{ marginBottom: "2rem", animation: "fadeUp 0.6s ease both" }}>
            <div style={{
              position: "relative", borderRadius: "16px", overflow: "hidden",
              height: "460px", background: "#111",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
                <img
                src={images[activeImg]}
                alt={car.title}   
                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.4s ease" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 40%)"
              }} />
              {/* Trust score overlay */}
              <div style={{
                position: "absolute", top: "1.25rem", right: "1.25rem",
                background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
                border: `2px solid ${trustColor(car.trustScore == null ? 0 : car.trustScore)}`,
                borderRadius: "12px", padding: "0.75rem 1rem", textAlign: "center"
              }}>
                <div style={{ fontSize: "1.8rem", fontFamily: "'Bebas Neue', cursive", color: trustColor(car.trustScore == null ? 0 : car.trustScore), lineHeight: 1 }}>
                  {car.trustScore == null ? "Pending" : car.trustScore}
                </div>
                <div style={{ fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2px" }}>
                  Trust Score
                </div>
                {car.trustBand && car.trustScore != null && (
                  <div style={{ fontSize: "0.65rem", color: "#f59e0b", marginTop: 4 }}>{car.trustBand}</div>
                )}
              </div>
              {/* Wishlist */}
              <button
                onClick={handleWishlistToggle}
                style={{
                  position: "absolute", top: "1.25rem", left: "1.25rem",
                  background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "50%", width: "44px", height: "44px",
                  color: wishlisted ? "#ef4444" : "#9ca3af",
                  cursor: "pointer", fontSize: "1.2rem",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                {wishlisted ? "♥" : "♡"}
              </button>
              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((activeImg - 1 + images.length) % images.length)} style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%", width: "40px", height: "40px",
                    color: "#fff", cursor: "pointer", fontSize: "1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(8px)"
                  }}>‹</button>
                  <button onClick={() => setActiveImg((activeImg + 1) % images.length)} style={{
                    position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "50%", width: "40px", height: "40px",
                    color: "#fff", cursor: "pointer", fontSize: "1rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(8px)"
                  }}>›</button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", overflowX: "auto", paddingBottom: "4px" }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className="thumb"
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: "88px", height: "60px", flexShrink: 0,
                    borderRadius: "8px", overflow: "hidden", cursor: "pointer",
                    border: `2px solid ${activeImg === i ? "#f59e0b" : "rgba(255,255,255,0.08)"}`,
                    transition: "border-color 0.2s"
                  }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Car Title */}
          <div style={{ marginBottom: "2rem", animation: "fadeUp 0.6s 0.1s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "3rem",
                  letterSpacing: "0.04em", color: "#fff", lineHeight: 1, marginBottom: "0.4rem"
                }}>
                  {car.title}  {/* fixed: was car.name */}
                </h1>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "#6b7280", alignItems: "center" }}>
                  <span>📍 {car.city}</span>  {/* fixed: was car.location */}
                  <span>•</span>
                  <span>Listed by <span style={{ color: "#f59e0b" }}>{car.sellerName || "Verified Seller"}</span></span>  {/* fixed: was car.seller */}
                  {car.verified && (
                    <span style={{
                      background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                      borderRadius: "100px", padding: "2px 10px",
                      fontSize: "0.72rem", color: "#10b981"
                    }}>✓ VERIFIED</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: "#f59e0b", lineHeight: 1 }}>
                  ₹{(car.price / 100000).toFixed(2)}L
                </div>
                <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                  EMI from ₹{emiMonthly.toLocaleString()}/mo
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ animation: "fadeUp 0.6s 0.15s ease both" }}>
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
              {["overview", "specs", "history", "emi"].map((tab) => (
                <button
                  key={tab}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "none", border: "none", padding: "0.75rem 1.5rem",
                    color: activeTab === tab ? "#f59e0b" : "#6b7280",
                    fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                    letterSpacing: "0.08em", cursor: "pointer",
                    borderBottom: activeTab === tab ? "2px solid #f59e0b" : "2px solid transparent",
                    marginBottom: "-1px", transition: "color 0.2s"
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.75rem", marginBottom: "1.5rem"
                }}>
                  {SPECS_MAP.slice(0, 4).map((s) => (
                    <div key={s.label} style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "10px", padding: "1rem", textAlign: "center"
                    }}>
                      <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{s.icon}</div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                        {car[s.key] || s.fallback}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ color: "#9ca3af", lineHeight: 1.8, fontSize: "0.9rem" }}>
                  {car.description || `This well-maintained ${car.title} is in excellent condition with all service records available. Single owner, no accidents, and full insurance validity. Perfect for family use with great mileage and a comfortable ride.`}
                  {/* fixed: was car.name in template literal */}
                </div>
                {Array.isArray(car.trustFactors) && car.trustFactors.length > 0 && (
                  <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12 }}>
                    <div style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", marginBottom: 8 }}>TRUST FACTORS</div>
                    {car.trustFactors.slice(0, 5).map((factor, idx) => (
                      <div key={`${factor.factor_key}-${idx}`} style={{ marginBottom: 6, fontSize: "0.82rem", color: "#d1d5db" }}>
                        <strong>{factor.factor_label}</strong>: {factor.factor_value || factor.explanation || "-"}
                      </div>
                    ))}
                    {role === "admin" && (
                      <button
                        onClick={async () => { await recomputeTrustScore(id); }}
                        style={{ marginTop: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, color: "#f59e0b", padding: "6px 10px", cursor: "pointer" }}
                      >
                        Recompute Trust Score
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {SPECS_MAP.map((s) => (
                  <div key={s.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.9rem 1rem", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px"
                  }}>
                    <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      {s.icon} {s.label}
                    </span>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>
                      {car[s.key] || s.fallback}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { icon: "🔑", event: "1st Owner Purchase", date: `${(car.year || 2021)} — Showroom`, color: "#10b981" },
                  { icon: "🔧", event: "Major Service", date: `${(car.year || 2021) + 1} — Authorized Service Center`, color: "#f59e0b" },
                  { icon: "📝", event: "Insurance Renewed", date: `${(car.year || 2021) + 2} — Valid Till 2026`, color: "#3b82f6" },
                  { icon: "✅", event: "AutoBazaar Inspection", date: "2025 — 120-Point Check Complete", color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", gap: "1rem", alignItems: "flex-start",
                    padding: "1rem", background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px"
                  }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: `${item.color}15`, border: `1px solid ${item.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.1rem", flexShrink: 0
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                        {item.event}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{item.date}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <span style={{
                        background: `${item.color}15`, border: `1px solid ${item.color}30`,
                        color: item.color, borderRadius: "100px", padding: "3px 10px", fontSize: "0.7rem"
                      }}>Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "emi" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { tenure: "12 months", rate: "8.5%", emi: Math.round(car.price * 0.85 / 12 * 1.045) },
                  { tenure: "24 months", rate: "8.9%", emi: Math.round(car.price * 0.85 / 24 * 1.095) },
                  { tenure: "36 months", rate: "9.2%", emi: Math.round(car.price * 0.85 / 36 * 1.15) },
                  { tenure: "60 months", rate: "9.5%", emi: emiMonthly },
                ].map((plan) => (
                  <div key={plan.tenure} style={{
                    padding: "1.25rem", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px"
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: "#f59e0b", lineHeight: 1, marginBottom: "0.25rem" }}>
                      ₹{plan.emi.toLocaleString()}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>per month</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem", fontSize: "0.8rem" }}>
                      <span style={{ color: "#6b7280" }}>Tenure</span>
                      <span style={{ color: "#fff" }}>{plan.tenure}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "#6b7280" }}>Rate</span>
                      <span style={{ color: "#fff" }}>{plan.rate}</span>
                    </div>
                    <button onClick={() => navigate(`/emi?carId=${car.id}`)} style={{
                      marginTop: "0.75rem", width: "100%", background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px",
                      padding: "0.5rem", color: "#f59e0b", fontSize: "0.8rem",
                      cursor: "pointer", fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.06em"
                    }}>
                      APPLY NOW
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Sticky Actions */}
        <div style={{ position: "sticky", top: "65px", height: "fit-content" }}>
          {/* Price card */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem",
            animation: "fadeUp 0.6s 0.2s ease both"
          }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: "#f59e0b", lineHeight: 1, marginBottom: "0.25rem" }}>
              ₹{(car.price / 100000).toFixed(2)}L
            </div>
            <div style={{ color: "#6b7280", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
              or ₹{emiMonthly.toLocaleString()}/month (60 months @ 9.5%)
            </div>

            <button
              className="action-btn"
              onClick={() => navigate(`/payment/${car.id}`)}
              style={{
                width: "100%", background: "#f59e0b", border: "none",
                borderRadius: "8px", padding: "1rem",
                color: "#000", fontFamily: "'Bebas Neue', cursive",
                fontSize: "1.2rem", letterSpacing: "0.1em",
                cursor: "pointer", marginBottom: "0.75rem",
                boxShadow: "0 8px 24px rgba(245,158,11,0.25)"
              }}>
              BUY NOW →
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                className="action-btn"
                onClick={handleWishlistToggle}
                style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "8px", padding: "0.8rem",
                  color: wishlisted ? "#ef4444" : "#9ca3af",
                  cursor: "pointer", fontSize: "0.85rem"
                }}>
                {wishlisted ? "♥ Saved" : "♡ Save"}
              </button>
              <button
                className="action-btn"
                onClick={handleCompareToggle}
                style={{
                  background: inCompare ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px", padding: "0.8rem",
                  color: inCompare ? "#f59e0b" : "#9ca3af", cursor: "pointer", fontSize: "0.85rem"
                }}>
                {inCompare ? "⊖ In Compare" : "⊕ Compare"}
              </button>
            </div>
          </div>

          {/* Bid card */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem",
            animation: "fadeUp 0.6s 0.25s ease both"
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem",
              letterSpacing: "0.08em", color: "#fff", marginBottom: "0.25rem"
            }}>
              PLACE A BID
            </h3>
            <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1rem" }}>
              Current asking: <span style={{ color: "#f59e0b" }}>₹{(car.price / 100000).toFixed(2)}L</span>
            </p>
            {bidsData.config && (
              <p style={{ color: "#9ca3af", fontSize: "0.76rem", marginBottom: "0.75rem" }}>
                Min increment: ₹{Number(bidsData.config.min_increment || 0).toLocaleString()} {bidsData.config.is_enabled ? "| Live" : "| Disabled"}
              </p>
            )}
            <div style={{ display: "flex", gap: "0", marginBottom: "0.75rem" }}>
              <span style={{
                background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)",
                borderRight: "none", borderRadius: "6px 0 0 6px",
                padding: "0.75rem 1rem", color: "#f59e0b", fontSize: "0.9rem"
              }}>₹</span>
              <input
                type="number"
                placeholder={Math.round(car.price * 0.9 / 100000 * 100) / 100 + "L"}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRight: "none", padding: "0.75rem",
                  color: "#e5e7eb", fontSize: "0.9rem", outline: "none"
                }}
              />
              <span style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderLeft: "none", borderRadius: "0 6px 6px 0",
                padding: "0.75rem 0.75rem", color: "#6b7280", fontSize: "0.8rem"
              }}>Lakh</span>
            </div>
            <button
              className="action-btn"
              onClick={handleBid}
              style={{
                width: "100%", background: bidSubmitted ? "#10b981" : "rgba(245,158,11,0.1)",
                border: `1px solid ${bidSubmitted ? "#10b981" : "rgba(245,158,11,0.3)"}`,
                borderRadius: "8px", padding: "0.8rem",
                color: bidSubmitted ? "#fff" : "#f59e0b",
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.3s"
              }}>
              {bidSubmitted ? "✓ BID PLACED!" : "SUBMIT BID →"}
            </button>
            {bidInfo && <p style={{ color: "#10b981", fontSize: "0.75rem", marginTop: 8 }}>{bidInfo}</p>}
            {bidError && <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 8 }}>{bidError}</p>}
            {isSellerView && !bidsData.config?.is_enabled && (
              <button
                onClick={handleEnableBidding}
                style={{ width: "100%", marginTop: 8, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, color: "#f59e0b", padding: "0.65rem", cursor: "pointer" }}
              >
                Enable Bidding (24h)
              </button>
            )}
            {isSellerView && bidsData.bids.length > 0 && (
              <div style={{ marginTop: 10, maxHeight: 180, overflowY: "auto" }}>
                {bidsData.bids.slice(0, 5).map((bid) => (
                  <div key={bid.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 8, marginBottom: 6 }}>
                    <div style={{ color: "#d1d5db", fontSize: "0.78rem" }}>
                      {bid.bidder_name} · ₹{Number(bid.bid_amount || 0).toLocaleString()} · {bid.status}
                    </div>
                    {bid.status === "PLACED" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <button onClick={() => handleAcceptBid(bid.id)} style={{ background: "#10b981", border: "none", borderRadius: 6, color: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: "0.72rem" }}>Accept</button>
                        <button onClick={() => handleRejectBid(bid.id)} style={{ background: "#ef4444", border: "none", borderRadius: 6, color: "#fff", padding: "4px 8px", cursor: "pointer", fontSize: "0.72rem" }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isBuyerView && bidsData.bids.length > 0 && (
              <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: 8 }}>
                Highest bid: ₹{Number(bidsData.bids[0].bid_amount || 0).toLocaleString()}
              </p>
            )}
          </div>

          {/* Make Offer */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem",
            animation: "fadeUp 0.6s 0.3s ease both"
          }}>
            <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.08em", color: "#fff", marginBottom: "1rem" }}>
              MAKE AN OFFER
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                placeholder="Your offer (₹ Lakh)"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px", padding: "0.75rem",
                  color: "#e5e7eb", fontSize: "0.85rem", outline: "none"
                }}
              />
              <button style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px", padding: "0.75rem 1rem",
                color: "#e5e7eb", cursor: "pointer",
                fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
                letterSpacing: "0.05em"
              }}>
                SEND
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.25rem",
            animation: "fadeUp 0.6s 0.35s ease both"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#000", fontWeight: 700, fontSize: "1rem"
              }}>
                {(car.sellerName || "VS").slice(0, 2).toUpperCase()}  {/* fixed: was car.seller */}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                  {car.sellerName || "Verified Seller"}  {/* fixed: was car.seller */}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>Member since 2022 · 45 sales</div>
              </div>
              <span style={{
                marginLeft: "auto",
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: "4px", padding: "2px 8px", fontSize: "0.7rem", color: "#10b981"
              }}>✓ TRUSTED</span>
            </div>
            <button style={{
              width: "100%", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
              padding: "0.75rem", color: "#e5e7eb",
              cursor: "pointer", fontSize: "0.85rem"
            }}>
              📞 Show Contact
            </button>
          </div>
        </div>
      </div>

      {/* Similar Cars */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 2rem 4rem" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.05em", color: "#fff", marginBottom: "1.5rem" }}>
          SIMILAR CARS
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {similarCars.map((c) => (
            <div key={c.id} className="similar-card"
              onClick={() => navigate(`/car/${c.id}`)}
              style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px", overflow: "hidden", cursor: "pointer"
              }}>
              <div style={{ height: "160px", overflow: "hidden" }}>
                <img
                  src={c.image || GALLERY_FALLBACKS[0]}
                  alt={c.title}  
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: "#fff", letterSpacing: "0.04em" }}>
                    {c.title}  {/* fixed: was c.name */}
                  </span>
                  <span style={{ color: "#f59e0b", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem" }}>
                    ₹{(c.price / 100000).toFixed(1)}L
                  </span>
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {c.city} · {c.km?.toLocaleString() || "45k"} km  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}