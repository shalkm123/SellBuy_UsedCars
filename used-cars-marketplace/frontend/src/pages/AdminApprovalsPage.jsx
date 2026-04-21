import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminApprovals, approveAdminListing, rejectAdminListing } from "../api";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminApprovalsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAdminApprovals();
      setItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (carId) => {
    setBusyId(carId);
    try {
      await approveAdminListing(carId);
      await load();
    } finally {
      setBusyId(null);
      setConfirmAction(null);
    }
  };

  const handleReject = async (carId) => {
    setBusyId(carId);
    try {
      await rejectAdminListing(carId, "Rejected by admin review");
      await load();
    } finally {
      setBusyId(null);
      setConfirmAction(null);
    }
  };

  const onConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "approve") {
      await handleApprove(confirmAction.carId);
      return;
    }
    await handleReject(confirmAction.carId);
  };

  return (
    <AdminSectionLayout
      title="Approvals"
      subtitle="Seller listings that are still under review and require admin action"
      rightSlot={<button onClick={load} style={{ background: "#f59e0b", border: "none", color: "#000", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700 }}>Refresh</button>}
    >
      {loading ? (
        <div style={{ color: "#9ca3af" }}>Loading approvals...</div>
      ) : error ? (
        <div style={{ color: "#f87171" }}>{error}</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#9ca3af" }}>No pending listing approvals.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: "#9ca3af", fontSize: 14 }}>
                    {item.brand} {item.model_name} | {item.location_city}, {item.location_state}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
                    Seller: {item.seller_name} ({item.seller_email}) | Status: {item.status}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f59e0b", fontWeight: 800, marginBottom: 8 }}>Rs {Number(item.price || 0).toLocaleString("en-IN")}</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => setConfirmAction({ type: "approve", carId: item.id, title: item.title })}
                      disabled={busyId === item.id}
                      style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setConfirmAction({ type: "reject", carId: item.id, title: item.title })}
                      disabled={busyId === item.id}
                      style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={confirmAction?.type === "approve" ? "Approve Listing" : "Reject Listing"}
        message={
          confirmAction
            ? `${confirmAction.type === "approve" ? "Approve" : "Reject"} listing "${confirmAction.title}"?`
            : ""
        }
        confirmLabel={confirmAction?.type === "approve" ? "Approve" : "Reject"}
        confirmColor={confirmAction?.type === "approve" ? "#4ade80" : "#f87171"}
        onConfirm={onConfirm}
        onCancel={() => setConfirmAction(null)}
        busy={busyId === confirmAction?.carId}
      />
    </AdminSectionLayout>
  );
}
