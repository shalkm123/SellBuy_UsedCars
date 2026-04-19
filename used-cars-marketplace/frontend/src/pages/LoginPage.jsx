import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ab-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .ab-root {
    min-height: 100vh; display: flex;
    background: #080808; font-family: 'DM Sans', sans-serif;
    overflow: hidden; padding-top: 70px;
  }
  .ab-left {
    position: relative; flex: 1.1;
    display: flex; flex-direction: column;
    justify-content: space-between;
    overflow: hidden; padding: 48px;
  }
  .ab-left-bg {
    position: absolute; inset: 0;
    background: url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=80') center/cover no-repeat;
    filter: brightness(0.28) saturate(0.7);
    animation: slowZoom 20s ease-in-out infinite alternate;
  }
  @keyframes slowZoom { from{transform:scale(1.05)} to{transform:scale(1.12)} }
  .ab-left-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(135deg,rgba(8,8,8,0.6) 0%,rgba(8,8,8,0.1) 50%,rgba(245,158,11,0.08) 100%);
  }
  .ab-left-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(245,158,11,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.04) 1px,transparent 1px);
    background-size: 60px 60px;
    animation: gridPulse 4s ease-in-out infinite;
  }
  @keyframes gridPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
  .ab-amber-orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
  .ab-orb1 { width:320px;height:320px;background:rgba(245,158,11,0.12);top:-80px;right:-80px; }
  .ab-orb2 { width:200px;height:200px;background:rgba(245,158,11,0.07);bottom:100px;left:-40px;animation:orbFloat 6s ease-in-out infinite; }
  @keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
  .ab-left-content { position:relative;z-index:2;display:flex;flex-direction:column;height:100%; }
  .ab-logo { display:flex;align-items:center;gap:12px; }
  .ab-logo-icon {
    width:44px;height:44px;background:#F59E0B;border-radius:10px;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;box-shadow:0 0 30px rgba(245,158,11,0.4);
  }
  .ab-logo-text { font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:#fff; }
  .ab-logo-text span { color:#F59E0B; }
  .ab-hero { flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0; }
  .ab-tagline {
    display:inline-flex;align-items:center;gap:8px;
    background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);
    border-radius:100px;padding:6px 16px;margin-bottom:24px;width:fit-content;
  }
  .ab-tagline-dot { width:6px;height:6px;border-radius:50%;background:#F59E0B;animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .ab-tagline-text { font-size:12px;font-weight:500;color:#F59E0B;letter-spacing:0.5px; }
  .ab-headline {
    font-family:'Bebas Neue',sans-serif;
    font-size:clamp(56px,6vw,88px);line-height:0.92;color:#fff;letter-spacing:1px;
  }
  .ab-headline span { color:#F59E0B;display:block; }
  .ab-subline { margin-top:20px;font-size:15px;line-height:1.65;color:rgba(255,255,255,0.45);max-width:360px; }
  .ab-stats { display:flex;gap:32px; }
  .ab-stat-val { font-family:'Bebas Neue',sans-serif;font-size:32px;color:#F59E0B;letter-spacing:1px; }
  .ab-stat-label { font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:0.5px;text-transform:uppercase;margin-top:2px; }
  .ab-left-bottom { position:relative;z-index:2;display:flex;align-items:center;gap:8px; }
  .ab-trust-badge {
    display:flex;align-items:center;gap:6px;
    background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
    border-radius:100px;padding:8px 16px;font-size:12px;color:rgba(255,255,255,0.45);
  }
  .ab-trust-dot { width:6px;height:6px;border-radius:50%;background:#22c55e; }
  .ab-right {
    width:480px;flex-shrink:0;background:#0d0d0d;
    border-left:1px solid rgba(255,255,255,0.06);
    display:flex;flex-direction:column;justify-content:center;
    padding:48px 44px;position:relative;overflow-y:auto;
  }
  .ab-right::before {
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(245,158,11,0.4),transparent);
  }
  .ab-right-glow {
    position:absolute;top:-100px;right:-100px;width:300px;height:300px;
    background:radial-gradient(circle,rgba(245,158,11,0.06),transparent 70%);pointer-events:none;
  }
  .ab-form-wrap { position:relative;z-index:1; }
  .ab-form-header { margin-bottom:32px; }
  .ab-form-title { font-family:'Bebas Neue',sans-serif;font-size:40px;color:#fff;letter-spacing:1px; }
  .ab-form-sub { font-size:14px;color:rgba(255,255,255,0.35);margin-top:4px; }
  .ab-toggle {
    display:flex;background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);border-radius:12px;
    padding:4px;margin-bottom:28px;
  }
  .ab-toggle-btn {
    flex:1;padding:10px;border:none;border-radius:9px;
    font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;
    cursor:pointer;transition:all 0.2s ease;
    background:transparent;color:rgba(255,255,255,0.35);
  }
  .ab-toggle-btn.active { background:#F59E0B;color:#000;box-shadow:0 4px 20px rgba(245,158,11,0.3); }
  .ab-roles { display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:28px; }
  .ab-role-btn {
    padding:14px 8px;border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);
    color:rgba(255,255,255,0.4);cursor:pointer;text-align:center;
    transition:all 0.2s ease;font-family:'DM Sans',sans-serif;
  }
  .ab-role-btn:hover { border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.05);color:rgba(255,255,255,0.7); }
  .ab-role-btn.active { border-color:rgba(245,158,11,0.6);background:rgba(245,158,11,0.1);color:#F59E0B; }
  .ab-role-emoji { font-size:22px;display:block;margin-bottom:6px; }
  .ab-role-label { font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;display:block; }
  .ab-role-desc { font-size:10px;margin-top:2px;display:block;opacity:0.6;line-height:1.3; }
  .ab-fields { display:flex;flex-direction:column;gap:16px;margin-bottom:24px; }
  .ab-field-label {
    font-size:11px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;
    color:rgba(255,255,255,0.3);margin-bottom:7px;display:block;
  }
  .ab-input-wrap { position:relative; }
  .ab-input {
    width:100%;padding:14px 16px;
    background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;font-size:14px;color:#fff;font-family:'DM Sans',sans-serif;
    outline:none;transition:all 0.2s ease;
  }
  .ab-input::placeholder { color:rgba(255,255,255,0.2); }
  .ab-input:focus { border-color:rgba(245,158,11,0.5);background:rgba(245,158,11,0.04);box-shadow:0 0 0 3px rgba(245,158,11,0.08); }
  .ab-pass-toggle {
    position:absolute;right:14px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;
    color:rgba(255,255,255,0.25);font-size:16px;padding:4px;transition:color 0.2s;
  }
  .ab-pass-toggle:hover { color:rgba(255,255,255,0.6); }
  .ab-submit {
    width:100%;padding:16px;background:#F59E0B;border:none;border-radius:12px;
    font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;
    color:#000;cursor:pointer;transition:all 0.2s ease;
    box-shadow:0 8px 30px rgba(245,158,11,0.25);position:relative;overflow:hidden;
  }
  .ab-submit:hover { background:#fbbf24;transform:translateY(-1px);box-shadow:0 12px 40px rgba(245,158,11,0.35); }
  .ab-submit:active { transform:translateY(0); }
  .ab-submit:disabled { opacity:0.6;cursor:not-allowed;transform:none; }
  .ab-switch { text-align:center;margin-top:20px;font-size:13px;color:rgba(255,255,255,0.3); }
  .ab-switch-btn {
    background:none;border:none;color:#F59E0B;cursor:pointer;
    font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;
  }
  .ab-switch-btn:hover { color:#fbbf24;text-decoration:underline; }
  .ab-error {
    background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
    border-radius:10px;padding:10px 14px;color:#ef4444;
    font-size:13px;margin-bottom:16px;
  }
  @media (max-width:900px) {
    .ab-left { display:none; }
    .ab-right { width:100%;border-left:none;padding:40px 28px; }
  }
`;

const ROLES = [
  { id: "buyer",  emoji: "🛒", label: "Buyer",  desc: "Browse & buy"  },
  { id: "seller", emoji: "🚗", label: "Seller", desc: "List & manage" },
];

const STATS = [
  { val: "12K+", label: "Cars Listed"  },
  { val: "8.2K", label: "Happy Buyers" },
  { val: "98%",  label: "Verified"     },
];

export default function LoginPage() {
  const [mode,     setMode]    = useState("login");
  const [role,     setRole]    = useState("buyer");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [form,     setForm]    = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    aadhaar_encrypted: "",
    age: "",
    city: "",
    state: "",
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const patch = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const user = await login(form.email, form.password);
        // Redirect based on role from server
        if (user.role === "admin")  navigate("/dashboard/admin");
        else if (user.role === "seller") navigate("/dashboard/seller");
        else navigate("/dashboard/buyer");
      } else {
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await register({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          phone_number: form.phone_number,
          aadhaar_encrypted: form.aadhaar_encrypted,
          age: form.age,
          city: form.city,
          state: form.state,
          role,
        });
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || (mode === "login" ? "Invalid email or password" : "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="ab-root">

        {/* LEFT PANEL */}
        <div className="ab-left">
          <div className="ab-left-bg" />
          <div className="ab-left-overlay" />
          <div className="ab-left-grid" />
          <div className="ab-amber-orb ab-orb1" />
          <div className="ab-amber-orb ab-orb2" />

          <div className="ab-left-content">
            <div className="ab-logo">
              <div className="ab-logo-icon">🚘</div>
              <span className="ab-logo-text">AUTO<span>BAZAAR</span></span>
            </div>

            <div className="ab-hero">
              <div className="ab-tagline">
                <div className="ab-tagline-dot" />
                <span className="ab-tagline-text">India's Smartest Car Marketplace</span>
              </div>
              <h1 className="ab-headline">
                FIND YOUR<span>PERFECT</span>DRIVE
              </h1>
              <p className="ab-subline">
                AI-powered matching, real-time auctions, fraud protection and transparent pricing — all in one place.
              </p>
            </div>

            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="ab-stats" style={{ marginBottom: 32 }}>
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="ab-stat-val">{s.val}</div>
                    <div className="ab-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="ab-left-bottom">
                <div className="ab-trust-badge"><div className="ab-trust-dot" /> SSL secured · 256-bit encryption</div>
                <div className="ab-trust-badge"><div className="ab-trust-dot" /> Zero hidden fees</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ab-right">
          <div className="ab-right-glow" />
          <div className="ab-form-wrap">

            <div className="ab-form-header">
              <h2 className="ab-form-title">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</h2>
              <p className="ab-form-sub">
                {mode === "login" ? "Sign in to access your dashboard" : "Create your free account in seconds"}
              </p>
            </div>

            {/* Login / Register toggle */}
            <div className="ab-toggle">
              {["login", "signup"].map((m) => (
                <button key={m} type="button"
                  className={`ab-toggle-btn ${mode === m ? "active" : ""}`}
                  onClick={() => { setMode(m); setError(""); }}>
                  {m === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {/* Role selector — signup only */}
            {mode === "signup" && (
              <div className="ab-roles">
                {ROLES.map(({ id, emoji, label, desc }) => (
                  <button key={id} type="button"
                    className={`ab-role-btn ${role === id ? "active" : ""}`}
                    onClick={() => setRole(id)}>
                    <span className="ab-role-emoji">{emoji}</span>
                    <span className="ab-role-label">{label}</span>
                    <span className="ab-role-desc">{desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && <div className="ab-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="ab-fields">

                {mode === "signup" && (
                  <>
                    <div>
                      <label className="ab-field-label">Full Name</label>
                      <div className="ab-input-wrap">
                        <input className="ab-input" type="text" placeholder="Rahul Sharma"
                          value={form.full_name} onChange={patch("full_name")} required />
                      </div>
                    </div>
                    <div>
                      <label className="ab-field-label">Phone Number</label>
                      <div className="ab-input-wrap">
                        <input className="ab-input" type="tel" placeholder="9876543210"
                          value={form.phone_number} onChange={patch("phone_number")} required />
                      </div>
                    </div>
                    <div>
                      <label className="ab-field-label">Aadhaar Number</label>
                      <div className="ab-input-wrap">
                        <input className="ab-input" type="text" maxLength="12" placeholder="12 digit Aadhaar"
                          value={form.aadhaar_encrypted} onChange={patch("aadhaar_encrypted")} required />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label className="ab-field-label">Age</label>
                        <div className="ab-input-wrap">
                          <input className="ab-input" type="number" min="18" placeholder="18"
                            value={form.age} onChange={patch("age")} required />
                        </div>
                      </div>
                      <div>
                        <label className="ab-field-label">Role</label>
                        <div className="ab-input-wrap">
                          <select className="ab-input" value={role} onChange={(e) => setRole(e.target.value)}>
                            {ROLES.map((r) => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="ab-field-label">City</label>
                      <div className="ab-input-wrap">
                        <input className="ab-input" type="text" placeholder="Mumbai"
                          value={form.city} onChange={patch("city")} required />
                      </div>
                    </div>
                    <div>
                      <label className="ab-field-label">State</label>
                      <div className="ab-input-wrap">
                        <input className="ab-input" type="text" placeholder="Maharashtra"
                          value={form.state} onChange={patch("state")} required />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="ab-field-label">Email Address</label>
                  <div className="ab-input-wrap">
                    <input className="ab-input" type="email" placeholder="rahul@example.com"
                      value={form.email} onChange={patch("email")} required />
                  </div>
                </div>

                <div>
                  <label className="ab-field-label">Password</label>
                  <div className="ab-input-wrap">
                    <input className="ab-input" type={showPass ? "text" : "password"}
                      placeholder="Min 6 characters" value={form.password}
                      onChange={patch("password")} required style={{ paddingRight: 44 }} />
                    <button type="button" className="ab-pass-toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="ab-field-label">Confirm Password</label>
                    <div className="ab-input-wrap">
                      <input
                        className="ab-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={form.confirmPassword}
                        onChange={patch("confirmPassword")}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="ab-submit" disabled={loading}>
                {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN →" : "CREATE ACCOUNT →"}
              </button>
            </form>

            <div className="ab-switch">
              {mode === "login" ? "New to AutoBazaar? " : "Need the full sign-up flow? "}
              <button type="button" className="ab-switch-btn"
                  onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
                  {mode === "login" ? "Create free account" : "Sign in instead"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}