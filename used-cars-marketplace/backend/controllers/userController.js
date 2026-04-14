const db = require("../config/db");

// GET /users — admin only
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone_number, age, city, state, role, is_verified, created_at, updated_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows.map((row) => ({ ...row, name: row.full_name, phone: row.phone_number })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /users/:id
const getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, full_name, email, phone_number, age, city, state, role, is_verified, created_at, updated_at FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ ...rows[0], name: rows[0].full_name, phone: rows[0].phone_number });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /users/:id — admin only
const deleteUser = async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /users/:id/role — admin only
const updateUserRole = async (req, res) => {
  const role = String(req.body.role || "").toUpperCase();
  const allowed = ["BUYER", "SELLER", "ADMIN"];
  if (!allowed.includes(role)) return res.status(400).json({ message: "Invalid role" });
  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    res.json({ message: "Role updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, deleteUser, updateUserRole };
