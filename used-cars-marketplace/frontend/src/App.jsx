import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import SellerDashboard from './pages/dashboardseller';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboardseller" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;