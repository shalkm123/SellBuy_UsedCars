import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminUsersPage } from "../api";

export default function AdminUsersPage() {
  const [data, setData] = useState({ counts: {}, users: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminUsersPage();
        setData(res.data || { counts: {}, users: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminSectionLayout title="All Users" subtitle="Complete user list across buyer, seller, and admin roles">
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading users...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: 999 }}>Total: {data.counts?.total || 0}</span>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: 999 }}>Buyers: {data.counts?.buyers || 0}</span>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: 999 }}>Sellers: {data.counts?.sellers || 0}</span>
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "6px 10px", borderRadius: 999 }}>Admins: {data.counts?.admins || 0}</span>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", textAlign: "left" }}>
                  <th style={{ padding: 10 }}>Name</th>
                  <th style={{ padding: 10 }}>Email</th>
                  <th style={{ padding: 10 }}>Role</th>
                  <th style={{ padding: 10 }}>Verified</th>
                </tr>
              </thead>
              <tbody>
                {(data.users || []).map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: 10 }}>{u.full_name}</td>
                    <td style={{ padding: 10, color: "#9ca3af" }}>{u.email}</td>
                    <td style={{ padding: 10 }}>{u.role}</td>
                    <td style={{ padding: 10 }}>{u.is_verified ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminSectionLayout>
  );
}
