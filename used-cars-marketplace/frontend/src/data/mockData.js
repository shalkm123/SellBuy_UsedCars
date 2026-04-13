// Mock Data for CarMarket App

export const mockCars = [
  {
    id: 1,
    title: "2021 Maruti Suzuki Swift VXI",
    brand: "Maruti Suzuki",
    model: "Swift",
    year: 2021,
    price: 620000,
    originalPrice: 750000,
    km: 28000,
    fuel: "Petrol",
    transmission: "Manual",
    city: "Delhi",
    condition: "Excellent",
    mileage: "22 kmpl",
    color: "Pearl Arctic White",
    owners: 1,
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80",
    sellerId: 2,
    sellerName: "Rahul Sharma",
    trustScore: 92,
    verified: true,
    status: "active",
    postedAt: "2024-01-10",
    description: "Well maintained, single owner, full service history available.",
    features: ["ABS", "Airbags", "Power Windows", "Music System", "Parking Sensors"],
    fairPrice: 595000,
    priceTag: "Fair Deal",
  },
  {
    id: 2,
    title: "2020 Honda City 4th Gen ZX",
    brand: "Honda",
    model: "City",
    year: 2020,
    price: 980000,
    originalPrice: 1200000,
    km: 42000,
    fuel: "Petrol",
    transmission: "Automatic",
    city: "Mumbai",
    condition: "Good",
    mileage: "17 kmpl",
    color: "Lunar Silver Metallic",
    owners: 1,
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80",
    sellerId: 3,
    sellerName: "Priya Mehta",
    trustScore: 88,
    verified: true,
    status: "active",
    postedAt: "2024-01-08",
    description: "Excellent condition sedan with sunroof. Company maintained.",
    features: ["Sunroof", "Lane Watch", "ABS", "EBD", "Cruise Control", "Apple CarPlay"],
    fairPrice: 1050000,
    priceTag: "Good Deal",
  },
  {
    id: 3,
    title: "2019 Hyundai Creta SX 4WD",
    brand: "Hyundai",
    model: "Creta",
    year: 2019,
    price: 1150000,
    originalPrice: 1500000,
    km: 55000,
    fuel: "Diesel",
    transmission: "Automatic",
    city: "Bangalore",
    condition: "Good",
    mileage: "19 kmpl",
    color: "Phantom Black",
    owners: 2,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80",
    sellerId: 4,
    sellerName: "Amit Singh",
    trustScore: 79,
    verified: false,
    status: "active",
    postedAt: "2024-01-05",
    description: "Second owner, all service records available at dealer.",
    features: ["4WD", "Ventilated Seats", "Wireless Charging", "Panoramic Sunroof"],
    fairPrice: 1080000,
    priceTag: "Slightly High",
  },
  {
    id: 4,
    title: "2022 Tata Nexon EV Prime",
    brand: "Tata",
    model: "Nexon EV",
    year: 2022,
    price: 1480000,
    originalPrice: 1700000,
    km: 18000,
    fuel: "Electric",
    transmission: "Automatic",
    city: "Pune",
    condition: "Excellent",
    mileage: "312 km range",
    color: "Glacier White",
    owners: 1,
    image: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=600&q=80",
    sellerId: 5,
    sellerName: "Neha Joshi",
    trustScore: 95,
    verified: true,
    status: "active",
    postedAt: "2024-01-12",
    description: "Battery health 98%. All accessories included. Under warranty.",
    features: ["Fast Charging", "Connected Tech", "TPMS", "7 Airbags", "Harman Sound"],
    fairPrice: 1500000,
    priceTag: "Fair Deal",
  },
  {
    id: 5,
    title: "2018 Toyota Fortuner 4x4 AT",
    brand: "Toyota",
    model: "Fortuner",
    year: 2018,
    price: 2800000,
    originalPrice: 3800000,
    km: 72000,
    fuel: "Diesel",
    transmission: "Automatic",
    city: "Hyderabad",
    condition: "Good",
    mileage: "14 kmpl",
    color: "Phantom Brown",
    owners: 2,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80",
    sellerId: 6,
    sellerName: "Vikram Reddy",
    trustScore: 85,
    verified: true,
    status: "active",
    postedAt: "2023-12-28",
    description: "Premium SUV, excellent on highways. All service done at Toyota dealer.",
    features: ["4x4", "7 Seater", "360 Camera", "JBL Audio", "Captain Seats"],
    fairPrice: 2650000,
    priceTag: "Slightly High",
  },
  {
    id: 6,
    title: "2023 Maruti Baleno Alpha CVT",
    brand: "Maruti Suzuki",
    model: "Baleno",
    year: 2023,
    price: 840000,
    originalPrice: 950000,
    km: 8000,
    fuel: "Petrol",
    transmission: "Automatic",
    city: "Chennai",
    condition: "Excellent",
    mileage: "22.35 kmpl",
    color: "Splendid Silver",
    owners: 1,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80",
    sellerId: 7,
    sellerName: "Kavya Nair",
    trustScore: 97,
    verified: true,
    status: "active",
    postedAt: "2024-01-14",
    description: "Brand new condition. Shifting city, urgent sale. Full warranty remaining.",
    features: ["HUD", "360 Camera", "Suzuki Connect", "TPMS", "6 Airbags"],
    fairPrice: 880000,
    priceTag: "Great Deal",
  },
];

export const mockBids = [
  { id: 1, carId: 2, buyerId: 1, amount: 950000, status: "pending", createdAt: "2024-01-15" },
  { id: 2, carId: 5, buyerId: 1, amount: 2700000, status: "countered", counterAmount: 2750000, createdAt: "2024-01-13" },
  { id: 3, carId: 3, buyerId: 1, amount: 1100000, status: "rejected", createdAt: "2024-01-10" },
];

export const mockWishlist = [1, 4, 6];

export const mockOffers = [
  { id: 1, carId: 1, car: mockCars[0], amount: 600000, status: "pending" },
  { id: 2, carId: 6, car: mockCars[5], amount: 820000, status: "accepted" },
];

export const mockSellerListings = [
  { ...mockCars[0], views: 234, inquiries: 12, bids: 3 },
  { ...mockCars[3], views: 187, inquiries: 8, bids: 1 },
];

export const mockAdminStats = {
  totalUsers: 1847,
  totalListings: 423,
  pendingApprovals: 18,
  totalRevenue: 284500,
  fraudAlerts: 7,
  activeBids: 94,
};

export const mockPendingListings = [
  { id: 101, title: "2020 Ford EcoSport Titanium", seller: "Rohan Das", price: 780000, submittedAt: "2024-01-15", trustScore: 62, flagged: true },
  { id: 102, title: "2019 Kia Seltos HTX", seller: "Anita Roy", price: 950000, submittedAt: "2024-01-14", trustScore: 88, flagged: false },
  { id: 103, title: "2021 MG Hector Plus", seller: "Suresh Kumar", price: 1650000, submittedAt: "2024-01-14", trustScore: 74, flagged: false },
];

export const mockRevenueData = [
  { month: "Aug", revenue: 18400, listings: 34 },
  { month: "Sep", revenue: 22100, listings: 41 },
  { month: "Oct", revenue: 19800, listings: 38 },
  { month: "Nov", revenue: 28300, listings: 52 },
  { month: "Dec", revenue: 31200, listings: 58 },
  { month: "Jan", revenue: 24500, listings: 47 },
];

export const mockChatHistory = [
  {
    role: "assistant",
    content: "Hi! I'm AutoBot 🚗 Tell me what kind of car you're looking for — budget, fuel type, city usage, family size — and I'll find the best matches for you!",
    time: "10:00 AM"
  }
];

export const formatPrice = (price) => {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${(price / 1000).toFixed(0)}K`;
};

export const getPriceTagColor = (tag) => {
  switch (tag) {
    case "Great Deal": return "bg-green-500/20 text-green-400 border border-green-500/30";
    case "Good Deal": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
    case "Fair Deal": return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    case "Slightly High": return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-400";
  }
};

export const getFuelIcon = (fuel) => {
  switch (fuel) {
    case "Electric": return "⚡";
    case "Diesel": return "🛢️";
    case "Petrol": return "⛽";
    case "CNG": return "🌿";
    default: return "⛽";
  }
};