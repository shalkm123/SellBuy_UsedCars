const db = require("../config/db");

// GET /dashboard/buyer
const buyerDashboard = async (req, res) => {
  try {
    const [purchases] = await db.query(
      `SELECT p.*, c.title, c.brand, c.model, c.image_url
       FROM payments p JOIN cars c ON p.car_id = c.id
       WHERE p.buyer_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    const [inquiries] = await db.query(
      `SELECT i.*, c.title, c.brand FROM inquiries i JOIN cars c ON i.car_id = c.id
       WHERE i.buyer_id = ? ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json({ purchases, inquiries });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /dashboard/seller
const sellerDashboard = async (req, res) => {
  try {
    const [listings] = await db.query(
      "SELECT * FROM cars WHERE seller_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    const [[{ total_earnings }]] = await db.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_earnings
       FROM payments p JOIN cars c ON p.car_id = c.id
       WHERE c.seller_id = ? AND p.status = 'completed'`,
      [req.user.id]
    );
    const [[counts]] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'approved') AS approved,
        SUM(status = 'pending') AS pending,
        SUM(status = 'sold') AS sold
       FROM cars WHERE seller_id = ?`,
      [req.user.id]
    );
    res.json({ listings, total_earnings, counts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /dashboard/admin
const adminDashboard = async (req, res) => {
  try {
    const [[userStats]] = await db.query(
      `SELECT COUNT(*) AS total_users,
        SUM(role = 'buyer') AS buyers,
        SUM(role = 'seller') AS sellers
       FROM users`
    );
    const [[carStats]] = await db.query(
      `SELECT COUNT(*) AS total_cars,
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'sold') AS sold
       FROM cars`
    );
    const [[paymentStats]] = await db.query(
      `SELECT COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_revenue
       FROM payments WHERE status = 'completed'`
    );
    const [recentCars] = await db.query(
      "SELECT c.*, u.name AS seller_name FROM cars c JOIN users u ON c.seller_id = u.id ORDER BY c.created_at DESC LIMIT 10"
    );
    res.json({ userStats, carStats, paymentStats, recentCars });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { buyerDashboard, sellerDashboard, adminDashboard };
