import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminRevenue } from "../api";

export default function AdminRevenuePage() {
  const [data, setData] = useState({ summary: {}, monthly: [], recent_transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminRevenue();
        setData(res.data || { summary: {}, monthly: [], recent_transactions: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminSectionLayout title="Revenue" subtitle="Payments summary and monthly performance">
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading revenue...</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>Total Revenue</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b" }}>Rs {Number(data.summary?.total_revenue || 0).toLocaleString("en-IN")}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>Transactions</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{data.summary?.total_transactions || 0}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12 }}>
              <div style={{ color: "#9ca3af", fontSize: 12 }}>Average Ticket</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Rs {Number(data.summary?.average_ticket || 0).toLocaleString("en-IN")}</div>
            </div>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", textAlign: "left" }}>
                  <th style={{ padding: 10 }}>Month</th>
                  <th style={{ padding: 10 }}>Revenue</th>
                  <th style={{ padding: 10 }}>Transactions</th>
                </tr>
              </thead>
              <tbody>
                {(data.monthly || []).map((m) => (
                  <tr key={m.month} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding: 10 }}>{m.month}</td>
                    <td style={{ padding: 10 }}>Rs {Number(m.revenue || 0).toLocaleString("en-IN")}</td>
                    <td style={{ padding: 10 }}>{m.transaction_count}</td>
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
