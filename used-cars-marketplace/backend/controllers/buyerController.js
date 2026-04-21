const db = require("../config/db");

// GET /buyer/nav-stats
const getBuyerNavStats = async (req, res) => {
  try {
    const [[wishlistStats]] = await db.query(
      `SELECT COUNT(*) AS wishlist_items
       FROM wishlist_items wi
       JOIN wishlists w ON w.id = wi.wishlist_id
       WHERE w.buyer_id = ?`,
      [req.user.id]
    );

    const [[messageStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_messages,
        SUM(status = 'open') AS open_messages,
        SUM(status = 'replied') AS replied_messages
       FROM inquiries
       WHERE buyer_id = ?`,
      [req.user.id]
    );

    const [[bidStats]] = await db.query(
      `SELECT
        COUNT(*) AS total_bids,
        SUM(status = 'PLACED') AS active_bids,
        SUM(status = 'OUTBID') AS outbid_bids,
        SUM(status = 'ACCEPTED') AS accepted_bids,
        SUM(status = 'REJECTED') AS rejected_bids
       FROM car_bids
       WHERE bidder_id = ?`,
      [req.user.id]
    );

    res.json({
      wishlist_items: Number(wishlistStats?.wishlist_items || 0),
      total_messages: Number(messageStats?.total_messages || 0),
      open_messages: Number(messageStats?.open_messages || 0),
      replied_messages: Number(messageStats?.replied_messages || 0),
      total_bids: Number(bidStats?.total_bids || 0),
      active_bids: Number(bidStats?.active_bids || 0),
      outbid_bids: Number(bidStats?.outbid_bids || 0),
      accepted_bids: Number(bidStats?.accepted_bids || 0),
      rejected_bids: Number(bidStats?.rejected_bids || 0),
      offers_total: Number(bidStats?.total_bids || 0),
      notifications: Number(messageStats?.replied_messages || 0) + Number(bidStats?.accepted_bids || 0),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /buyer/messages
const getBuyerMessages = async (req, res) => {
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
        c.location_city,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url,
        u.id AS seller_id,
        u.full_name AS seller_name,
        u.email AS seller_email,
        u.phone_number AS seller_phone
       FROM inquiries i
       JOIN cars c ON c.id = i.car_id
       JOIN users u ON u.id = c.seller_id
       WHERE i.buyer_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );

    res.json(rows.map((row) => ({ ...row, model: row.model_name, city: row.location_city })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /buyer/bids
const getBuyerBids = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.car_id,
        b.bid_amount,
        b.status,
        b.created_at,
        b.updated_at,
        c.title AS car_title,
        c.brand,
        c.model_name,
        c.location_city,
        c.price AS listed_price,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url,
        (SELECT MAX(b2.bid_amount) FROM car_bids b2 WHERE b2.car_id = b.car_id) AS highest_bid
       FROM car_bids b
       JOIN cars c ON c.id = b.car_id
       WHERE b.bidder_id = ?
         AND c.deleted_at IS NULL
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json(
      rows.map((row) => ({
        ...row,
        model: row.model_name,
        city: row.location_city,
        highest_bid: Number(row.highest_bid || 0),
        listed_price: Number(row.listed_price || 0),
        is_highest_bid: Number(row.bid_amount || 0) >= Number(row.highest_bid || 0),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /buyer/offers
const getBuyerOffers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.car_id,
        b.bid_amount,
        b.status,
        b.created_at,
        b.updated_at,
        c.title AS car_title,
        c.brand,
        c.model_name,
        c.location_city,
        c.price AS listed_price,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
       FROM car_bids b
       JOIN cars c ON c.id = b.car_id
       WHERE b.bidder_id = ?
         AND c.deleted_at IS NULL
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    const summary = {
      total: rows.length,
      active: rows.filter((row) => row.status === "PLACED").length,
      accepted: rows.filter((row) => row.status === "ACCEPTED").length,
      rejected: rows.filter((row) => row.status === "REJECTED").length,
      outbid: rows.filter((row) => row.status === "OUTBID").length,
    };

    res.json({
      summary,
      offers: rows.map((row) => ({ ...row, model: row.model_name, city: row.location_city })),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getBuyerNavStats,
  getBuyerMessages,
  getBuyerBids,
  getBuyerOffers,
};