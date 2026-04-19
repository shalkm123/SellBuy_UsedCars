import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminFraudAlerts } from "../api";

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminFraudAlerts();
        setAlerts(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminSectionLayout title="Fraud Alerts" subtitle="Listings and sellers that need manual risk review">
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div style={{ color: "#9ca3af" }}>No active fraud alerts.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{alert.listing.title}</div>
              <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 6 }}>
                Severity: {alert.severity} | Reason: {alert.reason}
              </div>
              <div style={{ color: "#d1d5db", fontSize: 13 }}>
                Seller: {alert.seller.name} | Verification: {alert.seller.verification_status} | Trust: {alert.listing.trust_score ?? "NA"}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSectionLayout>
  );
}
