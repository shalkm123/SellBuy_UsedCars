const db = require("../config/db");

const getMyVerification = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seller_verification WHERE user_id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Verification record not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const upsertMyVerification = async (req, res) => {
  const { aadhaar_last4, remarks } = req.body;
  if (!aadhaar_last4) return res.status(400).json({ message: "aadhaar_last4 is required" });
  try {
    await db.query(
      `INSERT INTO seller_verification (user_id, aadhaar_last4, verification_status, remarks)
       VALUES (?, ?, 'PENDING', ?)
       ON DUPLICATE KEY UPDATE aadhaar_last4 = VALUES(aadhaar_last4), verification_status = 'PENDING', remarks = VALUES(remarks), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, String(aadhaar_last4).slice(-4), remarks || null]
    );
    const [rows] = await db.query("SELECT * FROM seller_verification WHERE user_id = ?", [req.user.id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getAllVerifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sv.*, u.full_name, u.email, u.phone_number
       FROM seller_verification sv JOIN users u ON sv.user_id = u.id
       ORDER BY sv.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateVerificationStatus = async (req, res) => {
  const { verification_status, remarks } = req.body;
  const status = String(verification_status || "").toUpperCase();
  const allowed = ["PENDING", "APPROVED", "REJECTED"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid verification_status" });
  try {
    await db.query(
      "UPDATE seller_verification SET verification_status = ?, verified_at = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, status === "APPROVED" ? new Date() : null, remarks || null, req.params.id]
    );
    const [rows] = await db.query("SELECT user_id FROM seller_verification WHERE id = ?", [req.params.id]);
    if (rows.length > 0) {
      await db.query("UPDATE users SET is_verified = ? WHERE id = ?", [status === "APPROVED", rows[0].user_id]);
    }
    res.json({ message: "Verification updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMyVerification, upsertMyVerification, getAllVerifications, updateVerificationStatus };