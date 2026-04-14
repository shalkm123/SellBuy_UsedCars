const db = require("../config/db");

// POST /payments
const createPayment = async (req, res) => {
  const { car_id, payment_method } = req.body;
  if (!car_id) return res.status(400).json({ message: "car_id is required" });
  try {
    const [carRows] = await db.query("SELECT * FROM cars WHERE id = ? AND status = 'approved'", [car_id]);
    if (carRows.length === 0) return res.status(404).json({ message: "Car not available" });
    const car = carRows[0];
    const transaction_id = "TXN" + Date.now();
    const [result] = await db.query(
      "INSERT INTO payments (buyer_id, car_id, amount, status, payment_method, transaction_id) VALUES (?,?,?,?,?,?)",
      [req.user.id, car_id, car.price, "completed", payment_method || "online", transaction_id]
    );
    await db.query("UPDATE cars SET status = 'sold' WHERE id = ?", [car_id]);
    res.status(201).json({
      message: "Payment successful",
      paymentId: result.insertId,
      transaction_id,
      amount: car.price,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /payments/my — buyer's payment history
const getMyPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.title, c.brand, c.model, c.image_url
       FROM payments p JOIN cars c ON p.car_id = c.id
       WHERE p.buyer_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /payments — admin all payments
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.title AS car_title, u.name AS buyer_name, u.email AS buyer_email
       FROM payments p
       JOIN cars c ON p.car_id = c.id
       JOIN users u ON p.buyer_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPayment, getMyPayments, getAllPayments };
