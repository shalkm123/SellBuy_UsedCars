const db = require("../config/db");

// POST /inquiries
const createInquiry = async (req, res) => {
  const { car_id, message } = req.body;
  if (!car_id || !message) return res.status(400).json({ message: "car_id and message are required" });
  try {
    const [result] = await db.query(
      "INSERT INTO inquiries (buyer_id, car_id, message) VALUES (?, ?, ?)",
      [req.user.id, car_id, message]
    );
    res.status(201).json({ message: "Inquiry sent", inquiryId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /inquiries/car/:car_id — seller sees inquiries on their car
const getInquiriesByCar = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, u.full_name AS buyer_name, u.email AS buyer_email, u.phone_number AS buyer_phone
       FROM inquiries i JOIN users u ON i.buyer_id = u.id
       WHERE i.car_id = ? ORDER BY i.created_at DESC`,
      [req.params.car_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /inquiries/:id/status
const updateInquiryStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ["open", "replied", "closed"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  try {
    await db.query("UPDATE inquiries SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Inquiry status updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createInquiry, getInquiriesByCar, updateInquiryStatus };
