import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

const APP_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const titleCase = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getAssetUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${APP_BASE_URL}${value}`;
};

export const normalizeRole = (role) => String(role || "BUYER").toLowerCase();

export const normalizeUser = (user = {}) => ({
  ...user,
  id: user.id,
  name: user.full_name || user.name || "",
  full_name: user.full_name || user.name || "",
  phone: user.phone_number || user.phone || "",
  phone_number: user.phone_number || user.phone || "",
  role: normalizeRole(user.role),
});

export const normalizeCar = (car = {}) => {
  const imageUrl = car.image_url || car.image || car.images?.[0]?.image_url || car.images?.[0] || "";
  const images = Array.isArray(car.images)
    ? car.images.map((image) => ({ ...image, image_url: getAssetUrl(image.image_url || image) }))
    : [];

  return {
    ...car,
    city: car.location_city || car.city || "",
    state: car.location_state || car.state || "",
    model: car.model_name || car.model || "",
    model_name: car.model_name || car.model || "",
    year: car.manufacturing_year || car.year || "",
    km: Number(car.kilometers_driven ?? car.km_driven ?? car.km ?? 0),
    km_driven: Number(car.kilometers_driven ?? car.km_driven ?? car.km ?? 0),
    fuel: titleCase(car.fuel_type || car.fuel || ""),
    fuel_type: String(car.fuel_type || car.fuel || "").toUpperCase(),
    transmission: titleCase(car.transmission || ""),
    condition: titleCase(car.condition || ""),
    ownership: titleCase(car.ownership || car.owners || ""),
    owners: car.owners || car.ownership || "",
    image: getAssetUrl(imageUrl),
    image_url: getAssetUrl(imageUrl),
    images,
    sellerName: car.seller_name || car.sellerName || "",
    seller_name: car.seller_name || car.sellerName || "",
    sellerEmail: car.seller_email || car.sellerEmail || "",
    sellerPhone: car.seller_phone || car.sellerPhone || "",
    trustScore: car.trustScore ?? car.trust_score ?? 85,
    verified: car.verified ?? car.is_verified ?? false,
    priceTag: car.priceTag || car.price_tag || (Number(car.price) >= 1500000 ? "Great Deal" : Number(car.price) >= 800000 ? "Good Deal" : "Fair Deal"),
    currency: car.currency || "INR",
  };
};

const mapCars = (rows = []) => rows.map(normalizeCar);

const mapPayments = (rows = []) =>
  rows.map((row) => ({
    ...row,
    car: normalizeCar(row),
    model: row.model_name || row.model || "",
    city: row.location_city || row.city || "",
  }));

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
export const getAllCars = async (params) => {
  const query = { ...params };
  if (query.fuel && !query.fuel_type) query.fuel_type = query.fuel;
  if (query.city && !query.location_city) query.location_city = query.city;
  if (query.q && !query.search) query.search = query.q;
  if (query.model && !query.model_name) query.model_name = query.model;
  if (!query.status) query.status = "ACTIVE";
  delete query.fuel;
  delete query.city;
  delete query.q;
  delete query.model;

  const res = await API.get("/cars", { params: query });
  return { ...res, data: mapCars(res.data) };
};

export const getCarById = async (id) => {
  const res = await API.get(`/cars/${id}`);
  return { ...res, data: normalizeCar(res.data) };
};
export const addCar = (formData) => API.post("/cars", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateCar = (id, formData) => API.put(`/cars/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteCar = (id) => API.delete(`/cars/${id}`);
export const updateCarStatus = (id, status) => API.patch(`/cars/${id}/status`, { status });
export const getMyListings = () => API.get("/cars/seller/my-listings");
export const getCarImages = (id) => API.get(`/cars/${id}/images`);
export const addCarImage = (id, formData) => API.post(`/cars/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteCarImage = (imageId) => API.delete(`/cars/images/${imageId}`);

// Dashboard
export const getBuyerDashboard = async () => {
  const res = await API.get("/dashboard/buyer");
  return {
    ...res,
    data: {
      ...res.data,
      purchases: mapPayments(res.data.purchases || []),
      inquiries: res.data.inquiries || [],
    },
  };
};

export const getSellerDashboard = async () => {
  const res = await API.get("/dashboard/seller");
  return { ...res, data: { ...res.data, listings: mapCars(res.data.listings || []) } };
};

export const getAdminDashboard = async () => {
  const res = await API.get("/dashboard/admin");
  return { ...res, data: { ...res.data, recentCars: mapCars(res.data.recentCars || []) } };
};

// Payments
export const createPayment = (data) => API.post("/payments", data);
export const verifyPayment = (data) => API.patch("/payments/verify", data);
export const getMyPayments = () => API.get("/payments/my");
export const getAllPayments = () => API.get("/payments");

export const getMyOrders = () => API.get("/orders/my");
export const getSellerOrders = () => API.get("/orders/seller/my");
export const getAllOrders = () => API.get("/orders");
export const createOrder = (data) => API.post("/orders", data);
export const updateOrderStatus = (id, data) => API.patch(`/orders/${id}/status`, data);

// Profiles
export const getMyBuyerProfile = () => API.get("/profiles/buyer/me");
export const upsertMyBuyerProfile = (data) => API.put("/profiles/buyer/me", data);
export const getMySellerProfile = () => API.get("/profiles/seller/me");
export const upsertMySellerProfile = (data) => API.put("/profiles/seller/me", data);

// Seller verification
export const getMyVerification = () => API.get("/seller-verification/me");
export const upsertMyVerification = (data) => API.post("/seller-verification/me", data);
export const getAllVerifications = () => API.get("/seller-verification");
export const updateVerificationStatus = (id, data) => API.patch(`/seller-verification/${id}/status`, data);

// Wishlists
export const getMyWishlist = async () => {
  const res = await API.get("/wishlists/me");
  return { ...res, data: { ...res.data, items: mapCars(res.data.items || []) } };
};
export const addWishlistItem = (data) => API.post("/wishlists/items", data);
export const removeWishlistItem = (carId) => API.delete(`/wishlists/items/${carId}`);

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