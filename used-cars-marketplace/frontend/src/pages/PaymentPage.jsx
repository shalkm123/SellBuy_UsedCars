import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [loading, setLoading] = useState(false);

  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [upiId, setUpiId] = useState("");

  // Mock car details (in real app, get from route state or context)
  const car = {
    name: "Maruti Swift VXI 2021",
    price: 650000,
    seller: "Rajesh Kumar",
    image: "🚗",
  };

  const formatCurrency = (val) => "₹" + Number(val).toLocaleString("en-IN");

  const handleCardInput = (field, value) => {
    if (field === "number") {
      value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    }
    if (field === "expiry") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (field === "cvv") value = value.replace(/\D/g, "").slice(0, 3);
    setCardDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const isFormValid = () => {
    if (paymentMethod === "card") {
      return (
        cardDetails.name.trim() &&
        cardDetails.number.replace(/\s/g, "").length === 16 &&
        cardDetails.expiry.length === 5 &&
        cardDetails.cvv.length === 3
      );
    }
    if (paymentMethod === "upi") return upiId.includes("@");
    return true; // netbanking / cod always valid
  };

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "3rem 2.5rem", textAlign: "center", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2 style={{ color: "#16a34a", fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>Payment Successful!</h2>
          <p style={{ color: "#64748b", marginTop: "0.6rem" }}>
            Your booking for <strong>{car.name}</strong> has been confirmed.
          </p>
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "1rem", margin: "1.5rem 0", textAlign: "left" }}>
            <p style={{ margin: "0.3rem 0", fontSize: "0.9rem", color: "#374151" }}>
              <strong>Amount Paid:</strong> {formatCurrency(car.price)}
            </p>
            <p style={{ margin: "0.3rem 0", fontSize: "0.9rem", color: "#374151" }}>
              <strong>Transaction ID:</strong> TXN{Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
            <p style={{ margin: "0.3rem 0", fontSize: "0.9rem", color: "#374151" }}>
              <strong>Date:</strong> {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
            </p>
          </div>
          <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginBottom: "1.5rem" }}>
            A confirmation has been sent to your registered email.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#2563eb", color: "#fff", border: "none", borderRadius: 10,
              padding: "0.8rem 2rem", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", width: "100%",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "calc(70px + 2rem) 1rem 2rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1e293b", marginBottom: "1.5rem" }}>
          💳 Complete Payment
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem" }}>

          {/* Left: Payment Form */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>

            {/* Payment Method Tabs */}
            <p style={{ fontWeight: 600, color: "#334155", marginBottom: "1rem" }}>Select Payment Method</p>
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.8rem", flexWrap: "wrap" }}>
              {[
                { id: "card", label: "💳 Card" },
                { id: "upi", label: "📱 UPI" },
                { id: "netbanking", label: "🏦 Net Banking" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: 10,
                    border: paymentMethod === m.id ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                    background: paymentMethod === m.id ? "#eff6ff" : "#f8fafc",
                    color: paymentMethod === m.id ? "#2563eb" : "#64748b",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Card Form */}
            {paymentMethod === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Cardholder Name</label>
                  <input
                    placeholder="Rahul Sharma"
                    value={cardDetails.name}
                    onChange={(e) => handleCardInput("name", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Card Number</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => handleCardInput("number", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => handleCardInput("expiry", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CVV</label>
                    <input
                      placeholder="•••"
                      type="password"
                      maxLength={3}
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardInput("cvv", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === "upi" && (
              <div>
                <label style={labelStyle}>UPI ID</label>
                <input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={inputStyle}
                />
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                  e.g. 9876543210@paytm, name@okicici
                </p>
              </div>
            )}

            {/* Net Banking */}
            {paymentMethod === "netbanking" && (
              <div>
                <label style={labelStyle}>Select Bank</label>
                <select style={{ ...inputStyle, cursor: "pointer" }}>
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                </select>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                  You will be redirected to your bank's portal to complete payment.
                </p>
              </div>
            )}

            {/* Security note */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", padding: "0.8rem", background: "#f0fdf4", borderRadius: 10 }}>
              <span>🔒</span>
              <span style={{ fontSize: "0.82rem", color: "#16a34a" }}>
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              <p style={{ fontWeight: 600, color: "#334155", margin: "0 0 1rem" }}>Order Summary</p>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "2.5rem", background: "#f1f5f9", borderRadius: 12, padding: "0.5rem 0.8rem" }}>
                  {car.image}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>{car.name}</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#64748b" }}>Seller: {car.seller}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#475569" }}>
                  <span>Car Price</span>
                  <span>{formatCurrency(car.price)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#475569" }}>
                  <span>Platform Fee</span>
                  <span>₹999</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#16a34a" }}>
                  <span>Discount</span>
                  <span>-₹500</span>
                </div>
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.6rem", display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#1e293b" }}>
                  <span>Total</span>
                  <span>{formatCurrency(car.price + 999 - 500)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={!isFormValid() || loading}
              style={{
                background: isFormValid() ? "#2563eb" : "#cbd5e1",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "1rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isFormValid() ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              {loading ? "Processing..." : `Pay ${formatCurrency(car.price + 499)}`}
            </button>

            <p style={{ fontSize: "0.78rem", color: "#94a3b8", textAlign: "center" }}>
              By clicking Pay, you agree to our Terms &amp; Conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#475569",
  marginBottom: "0.4rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  fontSize: "0.9rem",
  color: "#1e293b",
  background: "#f8fafc",
  outline: "none",
  boxSizing: "border-box",
};

export default PaymentPage;