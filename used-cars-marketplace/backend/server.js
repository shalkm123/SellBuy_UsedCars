const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/wishlists", require("./routes/wishlists"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/seller-verification", require("./routes/seller-verification"));
app.use("/api/users", require("./routes/users"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/inquiries", require("./routes/inquiries"));
app.use("/api/chatbot", require("./routes/chatbot"));

// Health check
app.get("/", (req, res) => res.json({ message: "SellBuy Used Cars API running" }));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
