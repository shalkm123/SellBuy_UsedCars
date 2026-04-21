import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminAudit } from "../api";

export default function AdminAuditPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminAudit();
        setRows(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminSectionLayout title="Audit Log" subtitle="Recent admin actions for traceability and review">
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading audit logs...</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#9ca3af" }}>No audit logs available yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{row.action_type}</div>
                <div style={{ color: "#9ca3af", fontSize: 12 }}>{new Date(row.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>
                Actor: {row.actor_name || "System"} | Target: {row.target_type} #{row.target_id ?? "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminSectionLayout>
  );
}
