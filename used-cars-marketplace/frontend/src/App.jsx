import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/register";
import Homepage from "./pages/Homepage";
import Browsepage from "./pages/Browsepage";
import Cardetailpage from "./pages/Cardetailpage";
import Comparepage from "./pages/Comparepage";
import EMIpage from "./pages/EMIpage";
import Chatbotpage from "./pages/Chatbotpage";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Addlistingpage from "./pages/Addlistingpage";
import Admindashboard from "./pages/Admindashboard";
import PaymentPage from "./pages/PaymentPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import SellerVerificationPage from "./pages/SellerVerificationPage";
import { useAuth } from "./context/AuthContext";

function RoleSectionRoute() {
  const { user } = useAuth();
  const role = String(user?.role || "buyer").toLowerCase();

  if (role === "seller") return <SellerDashboard />;
  if (role === "admin") return <Admindashboard />;
  return <BuyerDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/browse" element={<Browsepage />} />
          <Route path="/car/:id" element={<Cardetailpage />} />
          <Route path="/compare" element={<Comparepage />} />
          <Route path="/emi" element={<EMIpage />} />

          {/* Protected - any logged in user */}
          <Route path="/chatbot" element={
            <ProtectedRoute><Chatbotpage /></ProtectedRoute>
          } />
          <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Buyer only */}
          <Route path="/buyer" element={
            <ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/buyer" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
          <Route path="/payment/:carId" element={
            <ProtectedRoute roles={["buyer"]}><PaymentPage /></ProtectedRoute>
          } />

          {/* Seller only */}
          <Route path="/seller" element={
            <ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} />
          <Route path="/add-listing" element={
            <ProtectedRoute roles={["seller"]}><Addlistingpage /></ProtectedRoute>
          } />
          <Route path="/post-listing" element={
            <ProtectedRoute roles={["seller"]}><Addlistingpage /></ProtectedRoute>
          } />
          <Route path="/verify" element={<ProtectedRoute roles={["seller"]}><SellerVerificationPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />

          <Route path="/messages" element={<ProtectedRoute><RoleSectionRoute /></ProtectedRoute>} />
          <Route path="/bids" element={<ProtectedRoute><RoleSectionRoute /></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><RoleSectionRoute /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><RoleSectionRoute /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/admin/listings" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/admin/revenue" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
