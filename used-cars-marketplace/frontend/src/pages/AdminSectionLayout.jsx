import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminSectionLayout({ title, subtitle, children, rightSlot }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainMargin = sidebarCollapsed ? 72 : 260;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        paddingTop: "70px",
      }}
    >
      <Sidebar role="admin" onToggle={setSidebarCollapsed} />

      <main
        style={{
          flex: 1,
          marginLeft: mainMargin,
          padding: "36px 32px",
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#f59e0b", marginBottom: 6 }}>
              Admin Section
            </p>
            <h1 style={{ fontSize: 34, lineHeight: 1.1, marginBottom: 8 }}>{title}</h1>
            {subtitle && <p style={{ color: "#9ca3af" }}>{subtitle}</p>}
          </div>
          {rightSlot || null}
        </div>

        {children}
      </main>
    </div>
  );
}
