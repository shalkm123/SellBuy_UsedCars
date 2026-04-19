import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 2 }}>
      LOADING...
    </div>
  );

  // Not logged in → send to /login, save where they were going
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Logged in but wrong role → send to their own dashboard
  const userRole = String(user.role || "").toLowerCase();
  const requiredRoles = Array.isArray(roles)
    ? roles.map((item) => String(item).toLowerCase())
    : role
      ? [String(role).toLowerCase()]
      : [];

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    const redirect = userRole === "admin" ? "/dashboard/admin" : userRole === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
    return <Navigate to={redirect} replace />;
  }

  return children;
}