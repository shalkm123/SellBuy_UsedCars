const db = require("../config/db");

const makeOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

const createOrder = async (req, res) => {
  const { car_id, currency } = req.body;
  if (!car_id) return res.status(400).json({ message: "car_id is required" });
  try {
    const [existing] = await db.query("SELECT * FROM orders WHERE car_id = ?", [car_id]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Order already exists for this car", order: existing[0] });
    }
    const [cars] = await db.query("SELECT id, seller_id, price FROM cars WHERE id = ? AND deleted_at IS NULL AND status = 'ACTIVE'", [car_id]);
    if (cars.length === 0) return res.status(404).json({ message: "Car not available" });
    const car = cars[0];
    const [result] = await db.query(
      "INSERT INTO orders (buyer_id, car_id, seller_id, order_number, amount, currency, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, car.id, car.seller_id, makeOrderNumber(), car.price, currency || "INR", "PENDING", "PENDING"]
    );
    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.title AS car_title, c.brand, c.model_name,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url,
        s.full_name AS seller_name
       FROM orders o
       JOIN cars c ON o.car_id = c.id
       JOIN users s ON o.seller_id = s.id
       WHERE o.buyer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.title AS car_title, c.brand, c.model_name,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url,
        b.full_name AS buyer_name
       FROM orders o
       JOIN cars c ON o.car_id = c.id
       JOIN users b ON o.buyer_id = b.id
       WHERE o.seller_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.title AS car_title, c.brand, c.model_name, b.full_name AS buyer_name, s.full_name AS seller_name
       FROM orders o
       JOIN cars c ON o.car_id = c.id
       JOIN users b ON o.buyer_id = b.id
       JOIN users s ON o.seller_id = s.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status, payment_status } = req.body;
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (String(req.user.role).toUpperCase() !== "ADMIN" && orders[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = [];
    const params = [];
    if (status) {
      updates.push("status = ?");
      params.push(String(status).toUpperCase());
    }
    if (payment_status) {
      updates.push("payment_status = ?");
      params.push(String(payment_status).toUpperCase());
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }
    params.push(req.params.id);
    await db.query(`UPDATE orders SET ${updates.join(", ")} WHERE id = ?`, params);
    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getSellerOrders, getAllOrders, updateOrderStatus };