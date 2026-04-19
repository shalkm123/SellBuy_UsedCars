import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminListingsPage, updateAdminListingStatus } from "../api";
import ConfirmModal from "../components/ConfirmModal";

const STATUSES = ["ALL", "UNDER_REVIEW", "ACTIVE", "INACTIVE", "SOLD", "DRAFT"];

export default function AdminListingsPage() {
  const [status, setStatus] = useState("ALL");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [pendingChange, setPendingChange] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminListingsPage(status === "ALL" ? undefined : { status });
      setRows(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const onStatusChange = async (carId, next) => {
    const row = rows.find((item) => item.id === carId);
    if (!row || row.status === next) return;
    setPendingChange({ carId, nextStatus: next, previousStatus: row.status, title: row.title });
  };

  const onConfirmStatusChange = async () => {
    if (!pendingChange) return;
    setBusyId(pendingChange.carId);
    try {
      await updateAdminListingStatus(pendingChange.carId, pendingChange.nextStatus);
      await load();
      setPendingChange(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminSectionLayout title="All Listings" subtitle="Moderate and manage all listings on the platform">
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{ cursor: "pointer", background: s === status ? "#f59e0b" : "rgba(255,255,255,0.06)", color: s === status ? "#000" : "#fff", border: "none", borderRadius: 999, padding: "6px 12px" }}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading listings...</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div key={row.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{row.title}</div>
                  <div style={{ color: "#9ca3af", fontSize: 13 }}>Seller: {row.seller_name} | {row.location_city}, {row.location_state}</div>
                </div>
                <div style={{ color: "#f59e0b", fontWeight: 700 }}>Rs {Number(row.price || 0).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>Status</span>
                <select
                  value={row.status}
                  disabled={busyId === row.id}
                  onChange={(e) => onStatusChange(row.id, e.target.value)}
                  style={{ background: "#111", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, padding: "6px 8px" }}
                >
                  {STATUSES.filter((s) => s !== "ALL").map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          {rows.length === 0 && <div style={{ color: "#9ca3af" }}>No listings found.</div>}
        </div>
      )}

      <ConfirmModal
        open={Boolean(pendingChange)}
        title="Confirm Status Change"
        message={
          pendingChange
            ? `Change status of "${pendingChange.title}" from ${pendingChange.previousStatus} to ${pendingChange.nextStatus}?`
            : ""
        }
        confirmLabel="Update Status"
        confirmColor="#f59e0b"
        onConfirm={onConfirmStatusChange}
        onCancel={() => setPendingChange(null)}
        busy={busyId === pendingChange?.carId}
      />
    </AdminSectionLayout>
  );
}
