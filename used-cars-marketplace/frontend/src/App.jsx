import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/browse" element={<Browsepage />} />
          <Route path="/car/:id" element={<Cardetailpage />} />
          <Route path="/compare" element={<Comparepage />} />
          <Route path="/emi" element={<EMIpage />} />

          {/* Protected - any logged in user */}
          <Route path="/chatbot" element={
            <ProtectedRoute><Chatbotpage /></ProtectedRoute>
          } />

          {/* Buyer only */}
          <Route path="/buyer" element={
            <ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>
          } />
          <Route path="/payment/:carId" element={
            <ProtectedRoute roles={["buyer"]}><PaymentPage /></ProtectedRoute>
          } />

          {/* Seller only */}
          <Route path="/seller" element={
            <ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>
          } />
          <Route path="/add-listing" element={
            <ProtectedRoute roles={["seller"]}><Addlistingpage /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><Admindashboard /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
