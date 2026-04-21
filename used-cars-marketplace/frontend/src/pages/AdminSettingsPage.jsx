import { useEffect, useState } from "react";
import AdminSectionLayout from "./AdminSectionLayout";
import { getAdminSettings, updateAdminSettings } from "../api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await getAdminSettings();
    setSettings(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateAdminSettings(settings);
      setMessage("Settings saved");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSectionLayout
      title="Admin Settings"
      subtitle="Platform-level configuration used by core workflows"
      rightSlot={<button onClick={onSave} disabled={saving} style={{ background: "#f59e0b", border: "none", color: "#000", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700 }}>{saving ? "Saving..." : "Save"}</button>}
    >
      <div style={{ display: "grid", gap: 10 }}>
        {settings.map((s, index) => (
          <div key={s.setting_key || index} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 12, background: "rgba(255,255,255,0.03)" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.setting_key}</div>
            <input
              value={s.setting_value || ""}
              onChange={(e) => {
                const next = [...settings];
                next[index] = { ...next[index], setting_value: e.target.value };
                setSettings(next);
              }}
              style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", borderRadius: 8, padding: "8px 10px" }}
            />
            <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 6 }}>{s.description}</div>
          </div>
        ))}
        {message && <div style={{ color: message.includes("saved") ? "#4ade80" : "#f87171" }}>{message}</div>}
      </div>
    </AdminSectionLayout>
  );
}
