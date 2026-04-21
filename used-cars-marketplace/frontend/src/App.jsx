import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

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
import SellerListingsPage from "./pages/SellerListingsPage";
import SellerBidsPage from "./pages/SellerBidsPage";
import SellerAnalyticsPage from "./pages/SellerAnalyticsPage";
import SellerMessagesPage from "./pages/SellerMessagesPage";
import BuyerMessagesPage from "./pages/BuyerMessagesPage";
import BuyerBidsPage from "./pages/BuyerBidsPage";
import BuyerOffersPage from "./pages/BuyerOffersPage";
import Addlistingpage from "./pages/Addlistingpage";
import Admindashboard from "./pages/Admindashboard";
import PaymentPage from "./pages/PaymentPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import SellerVerificationPage from "./pages/SellerVerificationPage";
import AdminApprovalsPage from "./pages/AdminApprovalsPage";
import AdminFraudPage from "./pages/AdminFraudPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminListingsPage from "./pages/AdminListingsPage";
import AdminRevenuePage from "./pages/AdminRevenuePage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminAuditPage from "./pages/AdminAuditPage";
import AdminMessagesPage from "./pages/AdminMessagesPage";
import { useAuth } from "./context/AuthContext";

function MessagesRoute() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    return <AdminMessagesPage />;
  }
  if (role === "seller") {
    return <SellerMessagesPage />;
  }
  return <BuyerMessagesPage />;
}

function BidsRoute() {
  const { user } = useAuth();
  if (String(user?.role || "").toLowerCase() === "seller") {
    return <SellerBidsPage />;
  }
  return <BuyerBidsPage />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
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
          <Route path="/my-listings" element={
            <ProtectedRoute roles={["seller"]}><SellerListingsPage /></ProtectedRoute>
          } />
          <Route path="/verify" element={<ProtectedRoute roles={["seller"]}><SellerVerificationPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={<ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>} />

          <Route path="/messages" element={<ProtectedRoute><MessagesRoute /></ProtectedRoute>} />
          <Route path="/bids" element={
            <ProtectedRoute roles={["buyer", "seller"]}><BidsRoute /></ProtectedRoute>
          } />
          <Route path="/offers" element={
            <ProtectedRoute roles={["buyer"]}><BuyerOffersPage /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute roles={["seller"]}><SellerAnalyticsPage /></ProtectedRoute>
          } />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute roles={["admin"]}><AdminApprovalsPage /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute roles={["admin"]}><AdminFraudPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/listings" element={<ProtectedRoute roles={["admin"]}><AdminListingsPage /></ProtectedRoute>} />
          <Route path="/admin/revenue" element={<ProtectedRoute roles={["admin"]}><AdminRevenuePage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute roles={["admin"]}><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute roles={["admin"]}><AdminAuditPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;