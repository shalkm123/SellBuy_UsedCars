import { useState, useEffect } from "react";

const EMIPage = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(9.5);
  const [tenure, setTenure] = useState(36);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const n = parseInt(tenure);
    if (principal && rate && n) {
      const emiVal = (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
      const total = emiVal * n;
      const interest = total - principal;
      setEmi(Math.round(emiVal));
      setTotalPayment(Math.round(total));
      setTotalInterest(Math.round(interest));
    }
  };

  const fmt = (val) => "₹" + Number(val).toLocaleString("en-IN");

  const interestPercent = totalPayment
    ? ((totalInterest / totalPayment) * 100).toFixed(1)
    : 0;
  const principalPercent = (100 - interestPercent).toFixed(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .emi-root {
          min-height: 100vh;
          background: #080808;
          padding-top: 70px;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          position: relative;
        }

        .emi-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 50% 40% at 80% 0%, rgba(245, 158, 11, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 90%, rgba(245, 158, 11, 0.04) 0%, transparent 50%);
          pointer-events: none;
        }

        .emi-hero {
          text-align: center;
          padding: 60px 24px 40px;
          position: relative;
          z-index: 1;
        }

        .emi-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 700;
          color: #f59e0b;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .emi-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 7vw, 72px);
          letter-spacing: 3px;
          line-height: 1;
          margin-bottom: 16px;
        }

        .emi-title span { color: #f59e0b; }

        .emi-sub {
          color: rgba(255, 255, 255, 0.4);
          font-size: 16px;
          max-width: 480px;
          margin: 0 auto;
        }

        .emi-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 24px 80px;
          position: relative;
          z-index: 1;
        }

        .emi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 700px) {
          .emi-grid { grid-template-columns: 1fr; }
        }

        .emi-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px;
        }

        .card-section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.25);
          margin-bottom: 24px;
        }

        .field { margin-bottom: 24px; }

        .field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .field-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 500;
        }

        .field-value {
          font-size: 15px;
          font-weight: 700;
          color: #f59e0b;
        }

        .emi-range {
          width: 100%;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          outline: none;
          cursor: pointer;
        }

        .emi-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid #080808;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
        }

        .emi-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #f59e0b;
          border: 2px solid #080808;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.2);
          margin-top: 6px;
        }

        .quick-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .qbtn {
          padding: 5px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .qbtn-active {
          background: rgba(245, 158, 11, 0.12);
          border: 1.5px solid rgba(245, 158, 11, 0.4);
          color: #f59e0b;
        }

        .qbtn-inactive {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.35);
        }

        .emi-hero-card {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(180, 117, 23, 0.06));
          border: 1px solid rgba(245, 158, 11, 0.22);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          margin-bottom: 16px;
        }

        .emi-hero-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .emi-hero-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(42px, 8vw, 64px);
          color: #f59e0b;
          letter-spacing: 2px;
          line-height: 1;
        }

        .emi-hero-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 6px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .stat-card-full { grid-column: span 2; }

        .stat-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .stat-value { font-size: 18px; font-weight: 700; }
        .stat-value-green { color: #22c55e; }
        .stat-value-red { color: #ef4444; }
        .stat-value-white { color: #fff; }

        .breakdown-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .breakdown-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.25);
          margin-bottom: 12px;
        }

        .bar-track {
          display: flex;
          height: 10px;
          border-radius: 99px;
          overflow: hidden;
          gap: 2px;
        }

        .bar-principal {
          background: #22c55e;
          border-radius: 99px 0 0 99px;
          transition: width 0.5s ease;
        }

        .bar-interest {
          background: #ef4444;
          border-radius: 0 99px 99px 0;
          transition: width 0.5s ease;
        }

        .bar-legend {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .legend-pct {
          color: rgba(255, 255, 255, 0.65);
          font-weight: 700;
        }

        .emi-disclaimer {
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.2);
          margin-top: 24px;
        }
      `}</style>

      <div className="emi-root">
        {/* Hero */}
        <div className="emi-hero">
          <div className="emi-label">&#9654; EMI Calculator</div>
          <h1 className="emi-title">Plan Your <span>Car Loan</span><br />Like a Pro</h1>
          <p className="emi-sub">Estimate monthly payments before you drive home your dream car</p>
        </div>

        <div className="emi-container">
          <div className="emi-grid">

            {/* Left: Inputs */}
            <div className="emi-card">
              <div className="card-section-title">Loan Details</div>

              {/* Loan Amount */}
              <div className="field">
                <div className="field-header">
                  <span className="field-label">Loan Amount</span>
                  <span className="field-value">{fmt(loanAmount)}</span>
                </div>
                <input
                  className="emi-range"
                  type="range" min="50000" max="5000000" step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
                <div className="range-labels"><span>₹50K</span><span>₹50L</span></div>
              </div>

              {/* Interest Rate */}
              <div className="field">
                <div className="field-header">
                  <span className="field-label">Annual Interest Rate</span>
                  <span className="field-value">{parseFloat(interestRate).toFixed(1)}%</span>
                </div>
                <input
                  className="emi-range"
                  type="range" min="6" max="20" step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
                <div className="range-labels"><span>6%</span><span>20%</span></div>
              </div>

              {/* Tenure */}
              <div className="field">
                <div className="field-header">
                  <span className="field-label">Loan Tenure</span>
                  <span className="field-value">{tenure} months</span>
                </div>
                <input
                  className="emi-range"
                  type="range" min="6" max="84" step="6"
                  value={tenure}
                  onChange={(e) => setTenure(parseInt(e.target.value))}
                />
                <div className="range-labels"><span>6 mo</span><span>84 mo</span></div>
              </div>

              {/* Quick Tenure Buttons */}
              <div className="quick-btns">
                {[12, 24, 36, 48, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTenure(m)}
                    className={`qbtn ${tenure === m ? "qbtn-active" : "qbtn-inactive"}`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

              {/* Monthly EMI */}
              <div className="emi-hero-card">
                <div className="emi-hero-label">Monthly EMI</div>
                <div className="emi-hero-value">{fmt(emi)}</div>
                <div className="emi-hero-sub">per month for {tenure} months</div>
              </div>

              {/* Stats */}
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-label">Principal</div>
                  <div className={`stat-value stat-value-green`}>{fmt(loanAmount)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Interest</div>
                  <div className={`stat-value stat-value-red`}>{fmt(totalInterest)}</div>
                </div>
                <div className={`stat-card stat-card-full`}>
                  <div className="stat-label">Total Payment</div>
                  <div className={`stat-value stat-value-white`}>{fmt(totalPayment)}</div>
                </div>
              </div>

              {/* Breakdown Bar */}
              <div className="breakdown-card">
                <div className="breakdown-title">Payment Breakdown</div>
                <div className="bar-track">
                  <div className="bar-principal" style={{ width: `${principalPercent}%` }} />
                  <div className="bar-interest" style={{ width: `${interestPercent}%` }} />
                </div>
                <div className="bar-legend">
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#22c55e" }} />
                    <span className="legend-text">Principal <span className="legend-pct">{principalPercent}%</span></span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-dot" style={{ background: "#ef4444" }} />
                    <span className="legend-text">Interest <span className="legend-pct">{interestPercent}%</span></span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <p className="emi-disclaimer">
            * Estimate only. Actual EMI may vary based on lender terms and processing fees.
          </p>
        </div>
      </div>
    </>
  );
};

export default EMIPage;