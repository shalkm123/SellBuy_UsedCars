const db = require("../config/db");

// GET /dashboard/buyer
const buyerDashboard = async (req, res) => {
  try {
    const [purchases] = await db.query(
      `SELECT o.*, p.status AS payment_status, p.amount, p.currency, c.title, c.brand, c.model_name,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
       FROM orders o
       JOIN cars c ON o.car_id = c.id
       LEFT JOIN payments p ON p.order_id = o.id
       WHERE o.buyer_id = ? ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    const [inquiries] = await db.query(
      `SELECT i.*, c.title, c.brand, c.model_name FROM inquiries i JOIN cars c ON i.car_id = c.id
       WHERE i.buyer_id = ? ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json({ purchases: purchases.map((row) => ({ ...row, model: row.model_name })), inquiries });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /dashboard/seller
const sellerDashboard = async (req, res) => {
  try {
    const [listings] = await db.query(
      "SELECT c.*, (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url FROM cars c WHERE c.seller_id = ? AND c.deleted_at IS NULL ORDER BY c.created_at DESC",
      [req.user.id]
    );
    const [[{ total_earnings }]] = await db.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_earnings
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN cars c ON o.car_id = c.id
       WHERE c.seller_id = ? AND p.status IN ('SUCCESS', 'VERIFIED')`,
      [req.user.id]
    );
    const [[counts]] = await db.query(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'ACTIVE') AS active,
        SUM(status = 'UNDER_REVIEW') AS under_review,
        SUM(status = 'DRAFT') AS draft,
        SUM(status = 'SOLD') AS sold,
        SUM(status = 'INACTIVE') AS inactive
       FROM cars WHERE seller_id = ?`,
      [req.user.id]
    );
    res.json({ listings: listings.map((row) => ({ ...row, model: row.model_name, city: row.location_city })), total_earnings, counts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /dashboard/admin
const adminDashboard = async (req, res) => {
  try {
    const [[userStats]] = await db.query(
      `SELECT COUNT(*) AS total_users,
        SUM(role = 'BUYER') AS buyers,
        SUM(role = 'SELLER') AS sellers,
        SUM(role = 'ADMIN') AS admins
       FROM users`
    );
    const [[carStats]] = await db.query(
      `SELECT COUNT(*) AS total_cars,
        SUM(status = 'DRAFT') AS draft,
        SUM(status = 'UNDER_REVIEW') AS under_review,
        SUM(status = 'ACTIVE') AS active,
        SUM(status = 'SOLD') AS sold,
        SUM(status = 'INACTIVE') AS inactive
       FROM cars`
    );
    const [[paymentStats]] = await db.query(
      `SELECT COUNT(*) AS total_payments,
        COALESCE(SUM(amount), 0) AS total_revenue
       FROM payments WHERE status IN ('SUCCESS', 'VERIFIED')`
    );
    const [recentCars] = await db.query(
      "SELECT c.*, u.full_name AS seller_name FROM cars c JOIN users u ON c.seller_id = u.id ORDER BY c.created_at DESC LIMIT 10"
    );
    res.json({ userStats, carStats, paymentStats, recentCars });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { buyerDashboard, sellerDashboard, adminDashboard };
