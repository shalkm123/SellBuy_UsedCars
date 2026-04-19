const db = require("../config/db");

const monthLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { month: "short" });
};

// GET /seller/nav-stats
const getSellerNavStats = async (req, res) => {
  try {
    const [[listingStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_listings,
        SUM(status = 'ACTIVE') AS active_listings
       FROM cars
       WHERE seller_id = ? AND deleted_at IS NULL`,
      [req.user.id]
    );

    const [[bidStats]] = await db.query(
      `SELECT COUNT(*) AS incoming_bids_new
       FROM car_bids b
       JOIN cars c ON c.id = b.car_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL
         AND b.status = 'PLACED'`,
      [req.user.id]
    );

    const [[messageStats]] = await db.query(
      `SELECT COUNT(*) AS unread_messages
       FROM inquiries i
       JOIN cars c ON c.id = i.car_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL
         AND i.status = 'open'`,
      [req.user.id]
    );

    const [verificationRows] = await db.query(
      `SELECT verification_status
       FROM seller_verification
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    const verificationStatus = verificationRows[0]?.verification_status || null;

    res.json({
      total_listings: Number(listingStats?.total_listings || 0),
      active_listings: Number(listingStats?.active_listings || 0),
      incoming_bids_new: Number(bidStats?.incoming_bids_new || 0),
      unread_messages: Number(messageStats?.unread_messages || 0),
      verification_status: verificationStatus,
      needs_verification: verificationStatus !== "APPROVED",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /seller/bids
const getSellerIncomingBids = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.car_id,
        b.bidder_id,
        b.bid_amount,
        b.status,
        b.created_at,
        c.title AS car_title,
        c.brand,
        c.model_name,
        u.full_name AS bidder_name,
        u.email AS bidder_email
       FROM car_bids b
       JOIN cars c ON c.id = b.car_id
       JOIN users u ON u.id = b.bidder_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /seller/messages
const getSellerMessages = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        i.id,
        i.car_id,
        i.message,
        i.status,
        i.created_at,
        c.title AS car_title,
        c.brand,
        c.model_name,
        u.full_name AS buyer_name,
        u.email AS buyer_email,
        u.phone_number AS buyer_phone
       FROM inquiries i
       JOIN cars c ON c.id = i.car_id
       JOIN users u ON u.id = i.buyer_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /seller/analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const [[baseStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_listings,
        SUM(status = 'ACTIVE') AS active_listings,
        SUM(status = 'SOLD') AS sold_listings
       FROM cars
       WHERE seller_id = ?
         AND deleted_at IS NULL`,
      [req.user.id]
    );

    const [[inquiryStats]] = await db.query(
      `SELECT COUNT(*) AS total_inquiries
       FROM inquiries i
       JOIN cars c ON c.id = i.car_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL`,
      [req.user.id]
    );

    const [[bidStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_bids,
        SUM(status = 'PLACED') AS open_bids,
        SUM(status = 'ACCEPTED') AS accepted_bids
       FROM car_bids b
       JOIN cars c ON c.id = b.car_id
       WHERE c.seller_id = ?
         AND c.deleted_at IS NULL`,
      [req.user.id]
    );

    const [[revenueStats]] = await db.query(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_revenue
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE o.seller_id = ?
         AND p.status IN ('SUCCESS', 'VERIFIED')`,
      [req.user.id]
    );

    const [revenueRows] = await db.query(
      `SELECT
        DATE_FORMAT(p.created_at, '%Y-%m-01') AS month_start,
        COALESCE(SUM(p.amount), 0) AS revenue
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       WHERE o.seller_id = ?
         AND p.status IN ('SUCCESS', 'VERIFIED')
         AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY month_start
       ORDER BY month_start ASC`,
      [req.user.id]
    );

    const monthlyRevenue = revenueRows.map((row) => ({
      month: monthLabel(row.month_start),
      revenue: Number(row.revenue || 0),
    }));

    const totalBids = Number(bidStats?.total_bids || 0);
    const acceptedBids = Number(bidStats?.accepted_bids || 0);
    const totalListings = Number(baseStats?.total_listings || 0);
    const soldListings = Number(baseStats?.sold_listings || 0);

    const bidConversionRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0;
    const listingSellThroughRate = totalListings > 0 ? Math.round((soldListings / totalListings) * 100) : 0;

    res.json({
      summary: {
        total_listings: totalListings,
        active_listings: Number(baseStats?.active_listings || 0),
        sold_listings: soldListings,
        total_inquiries: Number(inquiryStats?.total_inquiries || 0),
        total_bids: totalBids,
        open_bids: Number(bidStats?.open_bids || 0),
        accepted_bids: acceptedBids,
        total_revenue: Number(revenueStats?.total_revenue || 0),
        bid_conversion_rate: bidConversionRate,
        listing_sell_through_rate: listingSellThroughRate,
      },
      monthly_revenue: monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /seller/listings/:id/status
const updateSellerListingStatus = async (req, res) => {
  const nextStatus = String(req.body.status || "").toUpperCase();
  const allowedStatuses = ["ACTIVE", "INACTIVE", "UNDER_REVIEW"];
  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id FROM cars WHERE id = ? AND seller_id = ? AND deleted_at IS NULL",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    await db.query("UPDATE cars SET status = ? WHERE id = ?", [nextStatus, req.params.id]);
    res.json({ message: "Listing status updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getSellerNavStats,
  getSellerIncomingBids,
  getSellerMessages,
  getSellerAnalytics,
  updateSellerListingStatus,
};
