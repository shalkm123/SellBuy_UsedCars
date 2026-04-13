import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage        from "./pages/LoginPage";
import Homepage         from "./pages/Homepage";
import BuyerDashboard   from "./pages/BuyerDashboard";
import SellerDashboard  from "./pages/SellerDashboard";
import Admindashboard   from "./pages/Admindashboard";
import Browsepage       from "./pages/Browsepage";
import Comparepage      from "./pages/Comparepage";
import EMIpage          from "./pages/EMIpage";
import Chatbotpage      from "./pages/Chatbotpage";
import Cardetailpage    from "./pages/Cardetailpage";
import Addlistingpage   from "./pages/Addlistingpage";
import PaymentPage      from "./pages/PaymentPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>

          {/* Public */}
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* Role-specific dashboards */}
          <Route path="/dashboard/buyer" element={
            <ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/seller" element={
            <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute role="admin"><Admindashboard /></ProtectedRoute>
          } />

          {/* Protected — any logged-in user */}
          <Route path="/home"     element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/browse"   element={<ProtectedRoute><Browsepage /></ProtectedRoute>} />
          <Route path="/compare"  element={<ProtectedRoute><Comparepage /></ProtectedRoute>} />
          <Route path="/emi"      element={<ProtectedRoute><EMIpage /></ProtectedRoute>} />
          <Route path="/chatbot"  element={<ProtectedRoute><Chatbotpage /></ProtectedRoute>} />
          <Route path="/car/:id"  element={<ProtectedRoute><Cardetailpage /></ProtectedRoute>} />
          <Route path="/payment"  element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />

          {/* Seller only */}
          <Route path="/add-listing" element={
            <ProtectedRoute role="seller"><Addlistingpage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}