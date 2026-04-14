import { useEffect, useState } from "react";
import { getMyVerification, upsertMyVerification } from "../api";

export default function SellerVerificationPage() {
  const [form, setForm] = useState({ aadhaar_last4: "", remarks: "" });
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyVerification();
      setRecord(res.data);
      setForm({ aadhaar_last4: res.data.aadhaar_last4 || "", remarks: res.data.remarks || "" });
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await upsertMyVerification(form);
      setRecord(res.data);
      setMessage("Verification request submitted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit verification");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e5e7eb", paddingTop: 90, padding: "90px 24px 32px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Seller Verification</p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, lineHeight: 1, color: "#fff", marginBottom: 20 }}>Verification</h1>

        {loading && <div style={{ color: "rgba(255,255,255,.45)" }}>Loading verification status...</div>}
        {error && <div style={{ color: "#f87171", marginBottom: 16 }}>{error}</div>}
        {message && <div style={{ color: "#4ade80", marginBottom: 16 }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 20 }}>
          <Field label="Aadhaar Last 4 Digits">
            <input
              value={form.aadhaar_last4}
              maxLength={4}
              onChange={(e) => setForm((prev) => ({ ...prev, aadhaar_last4: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Remarks">
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>

          {record && (
            <div style={{ marginBottom: 16, color: "rgba(255,255,255,.65)", fontSize: 13 }}>
              Current status: <span style={{ color: "#f59e0b", fontWeight: 700 }}>{record.verification_status}</span>
            </div>
          )}

          <button disabled={saving} type="submit" style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "12px 18px", fontWeight: 800, cursor: "pointer" }}>
            {saving ? "Submitting..." : "Submit Verification"}
          </button>
        </form>
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
