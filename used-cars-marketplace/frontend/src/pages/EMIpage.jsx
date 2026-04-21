import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCarById, getCarEmiQuote } from "../api";

const calculateEmi = (principal, annualRate, months) => {
  const p = Number(principal);
  const r = Number(annualRate) / 12 / 100;
  const n = Number(months);
  if (!p || !r || !n) return { emi: 0, totalPayment: 0, totalInterest: 0 };
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;
  return { emi, totalPayment, totalInterest };
};

const fmt = (val) => `₹${Math.round(Number(val || 0)).toLocaleString("en-IN")}`;

export default function EMIPage() {
  const [searchParams] = useSearchParams();
  const carId = searchParams.get("carId");

  const [carTitle, setCarTitle] = useState("");
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(60);
  const [autoQuote, setAutoQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  useEffect(() => {
    const loadQuote = async () => {
      if (!carId) return;
      setLoadingQuote(true);
      try {
        const [carRes, quoteRes] = await Promise.all([getCarById(carId), getCarEmiQuote(carId)]);
        setCarTitle(carRes.data?.title || "");
        if (quoteRes?.data) {
          setAutoQuote(quoteRes.data);
          setLoanAmount(Number(quoteRes.data.principal || 0));
          setInterestRate(Number(quoteRes.data.annual_interest_rate || 9.5));
          setTenure(Number(quoteRes.data.tenure_months || 60));
        }
      } catch {
        setAutoQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    };

    loadQuote();
  }, [carId]);

  const values = useMemo(() => calculateEmi(loanAmount, interestRate, tenure), [loanAmount, interestRate, tenure]);
  const principalPercent = values.totalPayment ? ((Number(loanAmount) / values.totalPayment) * 100).toFixed(1) : 0;
  const interestPercent = values.totalPayment ? ((values.totalInterest / values.totalPayment) * 100).toFixed(1) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", padding: "90px 20px 30px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", letterSpacing: "0.06em", marginBottom: 8 }}>
          EMI CALCULATOR
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: 16 }}>
          {carTitle ? `Auto-loaded from ${carTitle}` : "Use this to estimate monthly payments."}
        </p>

        {carId && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ color: "#f59e0b", fontWeight: 700 }}>Database Auto EMI Quote</div>
            {loadingQuote ? (
              <div style={{ color: "#d1d5db", marginTop: 6 }}>Loading auto-generated quote...</div>
            ) : autoQuote ? (
              <div style={{ color: "#e5e7eb", marginTop: 6, fontSize: 14 }}>
                {fmt(autoQuote.monthly_emi)} / month for {autoQuote.tenure_months} months at {autoQuote.annual_interest_rate}%
              </div>
            ) : (
              <div style={{ color: "#fca5a5", marginTop: 6, fontSize: 14 }}>No auto quote available for this car yet.</div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
            <label style={{ display: "block", color: "#9ca3af", marginBottom: 6 }}>Loan Amount: {fmt(loanAmount)}</label>
            <input type="range" min="50000" max="5000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} style={{ width: "100%" }} />

            <label style={{ display: "block", color: "#9ca3af", margin: "16px 0 6px" }}>Annual Interest: {interestRate.toFixed(2)}%</label>
            <input type="range" min="6" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} style={{ width: "100%" }} />

            <label style={{ display: "block", color: "#9ca3af", margin: "16px 0 6px" }}>Tenure: {tenure} months</label>
            <input type="range" min="6" max="84" step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} style={{ width: "100%" }} />
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 }}>
            <div style={{ color: "#9ca3af", fontSize: 12 }}>MONTHLY EMI</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", color: "#f59e0b", fontSize: "3rem", lineHeight: 1 }}>{fmt(values.emi)}</div>

            <div style={{ marginTop: 10, color: "#d1d5db" }}>Principal: {fmt(loanAmount)}</div>
            <div style={{ marginTop: 6, color: "#d1d5db" }}>Total Interest: {fmt(values.totalInterest)}</div>
            <div style={{ marginTop: 6, color: "#d1d5db" }}>Total Payment: {fmt(values.totalPayment)}</div>

            <div style={{ marginTop: 14, height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${principalPercent}%`, background: "#22c55e" }} />
              <div style={{ width: `${interestPercent}%`, background: "#ef4444" }} />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>Principal {principalPercent}% | Interest {interestPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
