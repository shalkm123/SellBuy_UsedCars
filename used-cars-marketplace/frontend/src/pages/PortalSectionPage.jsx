import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function PortalSectionPage({ title, description, primaryAction }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const role = String(user?.role || "buyer").toLowerCase();
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
      <Sidebar role={role} onToggle={setSidebarCollapsed} />

      <main
        style={{
          flex: 1,
          marginLeft: mainMargin,
          padding: "36px 32px",
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <p
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#f59e0b",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            {role} section
          </p>
          <h1 style={{ fontSize: 34, lineHeight: 1.1, marginBottom: 10 }}>{title}</h1>
          <p style={{ color: "#9ca3af", lineHeight: 1.7, marginBottom: 20 }}>{description}</p>

          {primaryAction && (
            <button
              onClick={() => navigate(primaryAction.to)}
              style={{
                background: "#f59e0b",
                border: "none",
                color: "#000",
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
