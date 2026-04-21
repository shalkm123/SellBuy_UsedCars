export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#f59e0b",
  onConfirm,
  onCancel,
  busy = false,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2500,
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#101010",
          color: "#fff",
          padding: 18,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 22, lineHeight: 1.2 }}>{title}</h3>
        <p style={{ margin: 0, color: "#9ca3af", lineHeight: 1.6 }}>{message}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "#fff",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            style={{
              border: "none",
              background: confirmColor,
              color: "#000",
              fontWeight: 700,
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
