const db = require("../config/db");

const getMySellerProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM seller_profiles WHERE user_id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Seller profile not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const upsertMySellerProfile = async (req, res) => {
  const { business_name, bio, rating, total_listings } = req.body;
  try {
    await db.query(
      `INSERT INTO seller_profiles (user_id, business_name, bio, rating, total_listings)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE business_name = VALUES(business_name), bio = VALUES(bio), rating = VALUES(rating), total_listings = VALUES(total_listings), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, business_name || null, bio || null, rating ?? 0, total_listings ?? 0]
    );
    const [rows] = await db.query("SELECT * FROM seller_profiles WHERE user_id = ?", [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyBuyerProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM buyer_profiles WHERE user_id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Buyer profile not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const upsertMyBuyerProfile = async (req, res) => {
  const { preferred_budget_min, preferred_budget_max, preferred_location } = req.body;
  try {
    await db.query(
      `INSERT INTO buyer_profiles (user_id, preferred_budget_min, preferred_budget_max, preferred_location)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE preferred_budget_min = VALUES(preferred_budget_min), preferred_budget_max = VALUES(preferred_budget_max), preferred_location = VALUES(preferred_location), updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, preferred_budget_min ?? null, preferred_budget_max ?? null, preferred_location || null]
    );
    const [rows] = await db.query("SELECT * FROM buyer_profiles WHERE user_id = ?", [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMySellerProfile, upsertMySellerProfile, getMyBuyerProfile, upsertMyBuyerProfile };