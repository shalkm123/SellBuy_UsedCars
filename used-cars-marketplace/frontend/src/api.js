import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Cars
export const getAllCars = (params) => API.get("/cars", { params });
export const getCarById = (id) => API.get(`/cars/${id}`);
export const addCar = (formData) => API.post("/cars", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateCar = (id, formData) => API.put(`/cars/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteCar = (id) => API.delete(`/cars/${id}`);
export const updateCarStatus = (id, status) => API.patch(`/cars/${id}/status`, { status });
export const getMyListings = () => API.get("/cars/seller/my-listings");

// Dashboard
export const getBuyerDashboard = () => API.get("/dashboard/buyer");
export const getSellerDashboard = () => API.get("/dashboard/seller");
export const getAdminDashboard = () => API.get("/dashboard/admin");

// Payments
export const createPayment = (data) => API.post("/payments", data);
export const getMyPayments = () => API.get("/payments/my");
export const getAllPayments = () => API.get("/payments");

// Users (admin)
export const getAllUsers = () => API.get("/users");
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const updateUserRole = (id, role) => API.patch(`/users/${id}/role`, { role });

// Inquiries
export const createInquiry = (data) => API.post("/inquiries", data);
export const getInquiriesByCar = (carId) => API.get(`/inquiries/car/${carId}`);
export const updateInquiryStatus = (id, status) => API.patch(`/inquiries/${id}/status`, { status });

// Chatbot
export const sendChatMessage = (message) => API.post("/chatbot", { message });

export default API;