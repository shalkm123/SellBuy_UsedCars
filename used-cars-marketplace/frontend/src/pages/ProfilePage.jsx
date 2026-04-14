import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMe, getMyBuyerProfile, getMySellerProfile, upsertMyBuyerProfile, upsertMySellerProfile } from "../api";

export default function ProfilePage() {
  const { user } = useAuth();
  const role = String(user?.role || "buyer").toLowerCase();
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [accountRes, profileRes] = await Promise.all([
        getMe(),
        role === "seller" ? getMySellerProfile().catch(() => ({ data: null })) : getMyBuyerProfile().catch(() => ({ data: null })),
      ]);
      setAccount(accountRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (role === "seller") {
        const res = await upsertMySellerProfile(profile || {});
        setProfile(res.data);
      } else {
        const res = await upsertMyBuyerProfile(profile || {});
        setProfile(res.data);
      }
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const update = (key) => (e) => setProfile((prev) => ({ ...(prev || {}), [key]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", paddingTop: 90, padding: "90px 24px 32px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Account</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: "#fff", marginBottom: 20 }}>Profile</h1>

        {loading && <div style={{ color: "rgba(255,255,255,.45)" }}>Loading profile...</div>}
        {error && <div style={{ color: "#f87171", marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ color: "#4ade80", marginBottom: 16 }}>{message}</div>}

        {!loading && account && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ marginTop: 0, color: "#fff" }}>Account Details</h2>
              <p style={{ margin: "10px 0", color: "rgba(255,255,255,.7)" }}>Name: {account.full_name || account.name}</p>
              <p style={{ margin: "10px 0", color: "rgba(255,255,255,.7)" }}>Email: {account.email}</p>
              <p style={{ margin: "10px 0", color: "rgba(255,255,255,.7)" }}>Phone: {account.phone_number || account.phone}</p>
              <p style={{ margin: "10px 0", color: "rgba(255,255,255,.7)" }}>Role: {account.role}</p>
              <p style={{ margin: "10px 0", color: "rgba(255,255,255,.7)" }}>Location: {account.city}, {account.state}</p>
            </div>

            <form onSubmit={saveProfile} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
              <h2 style={{ marginTop: 0, color: "#fff" }}>{role === "seller" ? "Seller Profile" : "Buyer Profile"}</h2>
              {role === "seller" ? (
                <>
                  <Field label="Business Name">
                    <input value={profile?.business_name || ""} onChange={update("business_name")} style={inputStyle} />
                  </Field>
                  <Field label="Bio">
                    <textarea value={profile?.bio || ""} onChange={update("bio")} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  </Field>
                  <Field label="Rating">
                    <input type="number" step="0.01" value={profile?.rating ?? 0} onChange={update("rating")} style={inputStyle} />
                  </Field>
                  <Field label="Total Listings">
                    <input type="number" value={profile?.total_listings ?? 0} onChange={update("total_listings")} style={inputStyle} />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Preferred Budget Min">
                    <input type="number" value={profile?.preferred_budget_min ?? ""} onChange={update("preferred_budget_min")} style={inputStyle} />
                  </Field>
                  <Field label="Preferred Budget Max">
                    <input type="number" value={profile?.preferred_budget_max ?? ""} onChange={update("preferred_budget_max")} style={inputStyle} />
                  </Field>
                  <Field label="Preferred Location">
                    <input value={profile?.preferred_location || ""} onChange={update("preferred_location")} style={inputStyle} />
                  </Field>
                </>
              )}

              <button disabled={saving} type="submit" style={{ marginTop: 8, background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" }}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ marginBottom: 6, fontSize: 13, color: "rgba(255,255,255,.6)" }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};
