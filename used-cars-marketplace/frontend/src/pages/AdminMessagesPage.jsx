import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminMessages } from "../api";

export default function AdminMessagesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAdminMessages();
        setRows(res.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminSectionLayout title="Messages" subtitle="Platform-wide inquiry messages between buyers and sellers">
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading messages...</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#9ca3af" }}>No messages found.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{row.car_title}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{new Date(row.created_at).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ fontSize: 13, color: "#d1d5db", marginTop: 4 }}>
                Buyer: {row.buyer_name} | Seller: {row.seller_name} | Status: {row.status}
              </div>
              <div style={{ marginTop: 8, color: "#fff" }}>{row.message}</div>
            </div>
          ))}
        </div>
      )}
    </AdminSectionLayout>
  );
}
