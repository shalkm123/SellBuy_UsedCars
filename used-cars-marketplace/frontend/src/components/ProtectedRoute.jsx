import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires the user to be logged in.
 * If not authenticated, redirects to /login and saves the
 * intended destination so we can redirect back after login.
 *
 * Usage in your router:
 *   <Route path="/dashboard/buyer"  element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
 *   <Route path="/dashboard/seller" element={<ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>} />
 *   <Route path="/dashboard/admin"  element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
 *   <Route path="/compare"          element={<ProtectedRoute><Compare /></ProtectedRoute>} />
 *   <Route path="/emi"              element={<ProtectedRoute><EMICalc /></ProtectedRoute>} />
 *   <Route path="/chatbot"          element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → send to /login, remember where they were going
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → send to their own dashboard
  if (role && user.role !== role) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}
