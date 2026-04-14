const db = require("../config/db");

// GET /cars — browse with filters
const getAllCars = async (req, res) => {
  const { brand, fuel, transmission, min_price, max_price, city, search } = req.query;
  let query = "SELECT c.*, u.name AS seller_name FROM cars c JOIN users u ON c.seller_id = u.id WHERE c.status = 'approved'";
  const params = [];

  if (brand) { query += " AND c.brand = ?"; params.push(brand); }
  if (fuel) { query += " AND c.fuel = ?"; params.push(fuel); }
  if (transmission) { query += " AND c.transmission = ?"; params.push(transmission); }
  if (min_price) { query += " AND c.price >= ?"; params.push(min_price); }
  if (max_price) { query += " AND c.price <= ?"; params.push(max_price); }
  if (city) { query += " AND c.city = ?"; params.push(city); }
  if (search) { query += " AND (c.title LIKE ? OR c.brand LIKE ? OR c.model LIKE ?)"; const s = `%${search}%`; params.push(s, s, s); }

  query += " ORDER BY c.created_at DESC";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /cars/:id
const getCarById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT c.*, u.name AS seller_name, u.phone AS seller_phone FROM cars c JOIN users u ON c.seller_id = u.id WHERE c.id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /cars — seller adds listing
const addCar = async (req, res) => {
  const { title, brand, model, year, price, fuel, transmission, mileage, km_driven, description, city } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  if (!title || !brand || !model || !year || !price || !fuel || !transmission) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO cars (seller_id, title, brand, model, year, price, fuel, transmission, mileage, km_driven, description, city, image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [req.user.id, title, brand, model, year, price, fuel, transmission, mileage || null, km_driven || 0, description || null, city || null, image_url]
    );
    res.status(201).json({ message: "Car listing submitted for review", carId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /cars/:id — seller updates own listing
const updateCar = async (req, res) => {
  const { title, brand, model, year, price, fuel, transmission, mileage, km_driven, description, city } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM cars WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    if (rows[0].seller_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const image_url = req.file ? `/uploads/${req.file.filename}` : rows[0].image_url;
    await db.query(
      "UPDATE cars SET title=?, brand=?, model=?, year=?, price=?, fuel=?, transmission=?, mileage=?, km_driven=?, description=?, city=?, image_url=? WHERE id=?",
      [title, brand, model, year, price, fuel, transmission, mileage, km_driven, description, city, image_url, req.params.id]
    );
    res.json({ message: "Car updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /cars/:id
const deleteCar = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cars WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    if (rows[0].seller_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    await db.query("DELETE FROM cars WHERE id = ?", [req.params.id]);
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /cars/:id/status — admin approves/rejects
const updateCarStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["approved", "rejected", "pending", "sold"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    await db.query("UPDATE cars SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: `Car status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /cars/seller/my-listings — seller's own cars
const getMyListings = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM cars WHERE seller_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllCars, getCarById, addCar, updateCar, deleteCar, updateCarStatus, getMyListings };
