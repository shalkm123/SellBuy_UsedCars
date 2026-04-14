const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const fullName = req.body.full_name || req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phoneNumber = req.body.phone_number || req.body.phone;
  const aadhaarEncrypted = req.body.aadhaar_encrypted || req.body.aadhaar;
  const age = req.body.age;
  const city = req.body.city;
  const state = req.body.state;
  const requestedRole = String(req.body.role || "BUYER").toUpperCase();
  const role = ["BUYER", "SELLER"].includes(requestedRole) ? requestedRole : "BUYER";

  if (!fullName || !email || !password || !phoneNumber || !aadhaarEncrypted || !age || !city || !state) {
    return res.status(400).json({ message: "full_name, email, password, phone_number, aadhaar_encrypted, age, city and state are required" });
  }
  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const [phoneExisting] = await db.query("SELECT id FROM users WHERE phone_number = ?", [phoneNumber]);
    if (phoneExisting.length > 0) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (full_name, email, password_hash, phone_number, aadhaar_encrypted, age, city, state, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [fullName, email, hashed, phoneNumber, aadhaarEncrypted, age, city, state, role]
    );

    if (role === "SELLER") {
      await db.query("INSERT INTO seller_profiles (user_id) VALUES (?)", [result.insertId]);
    }
    if (role === "BUYER") {
      await db.query("INSERT INTO buyer_profiles (user_id) VALUES (?)", [result.insertId]);
    }

    res.status(201).json({
      message: "Registration successful",
      userId: result.insertId,
      user: { id: result.insertId, full_name: fullName, email, phone_number: phoneNumber, role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email, role: String(user.role).toUpperCase() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: String(user.role).toUpperCase() },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.full_name, u.email, u.phone_number, u.age, u.city, u.state, u.role, u.is_verified, u.created_at, u.updated_at,
        sp.business_name, sp.bio, sp.rating, sp.total_listings,
        bp.preferred_budget_min, bp.preferred_budget_max, bp.preferred_location,
        sv.verification_status, sv.aadhaar_last4, sv.verified_at
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN buyer_profiles bp ON bp.user_id = u.id
       LEFT JOIN seller_verification sv ON sv.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ ...rows[0], name: rows[0].full_name, phone: rows[0].phone_number });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, getMe };
