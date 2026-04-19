const db = require("../config/db");

const isSellerLike = (role) => ["SELLER", "ADMIN"].includes(String(role || "").toUpperCase());

const createOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const getBiddingSnapshot = async (carId) => {
  const [configRows] = await db.query(
    "SELECT is_enabled, min_increment, end_time FROM bidding_config WHERE car_id = ? LIMIT 1",
    [carId]
  );
  const [highestRows] = await db.query(
    "SELECT id, bidder_id, bid_amount FROM car_bids WHERE car_id = ? AND status IN ('PLACED', 'ACCEPTED') ORDER BY bid_amount DESC, id DESC LIMIT 1",
    [carId]
  );

  return {
    config: configRows[0] || null,
    highest: highestRows[0] || null,
  };
};

const upsertBiddingConfig = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const [carRows] = await db.query("SELECT id, seller_id FROM cars WHERE id = ? AND deleted_at IS NULL", [carId]);
    if (carRows.length === 0) return res.status(404).json({ message: "Car not found" });

    const userRole = String(req.user.role || "").toUpperCase();
    if (carRows[0].seller_id !== req.user.id && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isEnabled = req.body.is_enabled !== undefined ? Boolean(req.body.is_enabled) : true;
    const minIncrement = Number(req.body.min_increment || 5000);
    const endTime = req.body.end_time ? new Date(req.body.end_time) : null;

    if (Number.isNaN(minIncrement) || minIncrement <= 0) {
      return res.status(400).json({ message: "min_increment must be greater than 0" });
    }

    await db.query(
      `INSERT INTO bidding_config (car_id, is_enabled, min_increment, end_time)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_enabled = VALUES(is_enabled),
         min_increment = VALUES(min_increment),
         end_time = VALUES(end_time),
         updated_at = CURRENT_TIMESTAMP`,
      [carId, isEnabled, minIncrement, endTime]
    );

    const [rows] = await db.query(
      "SELECT is_enabled, min_increment, end_time FROM bidding_config WHERE car_id = ? LIMIT 1",
      [carId]
    );
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const bidAmount = Number(req.body.bid_amount);

    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ message: "bid_amount must be greater than 0" });
    }

    const [carRows] = await db.query(
      "SELECT id, seller_id, price, status FROM cars WHERE id = ? AND deleted_at IS NULL",
      [carId]
    );
    if (carRows.length === 0) return res.status(404).json({ message: "Car not found" });

    const car = carRows[0];
    if (car.seller_id === req.user.id) {
      return res.status(400).json({ message: "Seller cannot bid on own listing" });
    }
    if (String(car.status).toUpperCase() !== "ACTIVE") {
      return res.status(400).json({ message: "Bidding is only allowed on ACTIVE listings" });
    }

    const { config, highest } = await getBiddingSnapshot(carId);
    if (!config || !config.is_enabled) {
      return res.status(400).json({ message: "Bidding is not enabled for this car" });
    }
    if (config.end_time && new Date(config.end_time).getTime() < Date.now()) {
      return res.status(400).json({ message: "Bidding window has closed" });
    }

    const minIncrement = Number(config.min_increment || 0);
    const baseAmount = highest ? Number(highest.bid_amount) : Number(car.price);
    const minimumAllowed = baseAmount + minIncrement;

    if (bidAmount < minimumAllowed) {
      return res.status(400).json({
        message: "Bid is below minimum increment",
        minimumAllowed,
      });
    }

    const [result] = await db.query(
      "INSERT INTO car_bids (car_id, bidder_id, bid_amount, status) VALUES (?, ?, ?, 'PLACED')",
      [carId, req.user.id, bidAmount]
    );

    if (highest && highest.id) {
      await db.query("UPDATE car_bids SET status = 'OUTBID' WHERE id = ?", [highest.id]);
    }

    return res.status(201).json({ message: "Bid placed successfully", bidId: result.insertId });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getBidsByCar = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const [carRows] = await db.query("SELECT id, seller_id FROM cars WHERE id = ? AND deleted_at IS NULL", [carId]);
    if (carRows.length === 0) return res.status(404).json({ message: "Car not found" });

    const userRole = String(req.user.role || "").toUpperCase();
    const isOwnerOrAdmin = carRows[0].seller_id === req.user.id || userRole === "ADMIN";

    let query =
      `SELECT b.id, b.bid_amount, b.status, b.created_at, u.full_name AS bidder_name
       FROM car_bids b
       JOIN users u ON b.bidder_id = u.id
       WHERE b.car_id = ?`;
    const params = [carId];

    if (!isOwnerOrAdmin) {
      query += " AND b.bidder_id = ?";
      params.push(req.user.id);
    }

    query += " ORDER BY b.bid_amount DESC, b.created_at DESC";
    const [rows] = await db.query(query, params);

    const [configRows] = await db.query(
      "SELECT is_enabled, min_increment, end_time FROM bidding_config WHERE car_id = ? LIMIT 1",
      [carId]
    );

    return res.json({
      config: configRows[0] || null,
      bids: rows,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const acceptBid = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const bidId = Number(req.params.bidId);

    const [carRows] = await db.query("SELECT id, seller_id FROM cars WHERE id = ? AND deleted_at IS NULL", [carId]);
    if (carRows.length === 0) return res.status(404).json({ message: "Car not found" });

    const userRole = String(req.user.role || "").toUpperCase();
    if (carRows[0].seller_id !== req.user.id && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [bidRows] = await db.query(
      "SELECT id, bidder_id, bid_amount FROM car_bids WHERE id = ? AND car_id = ?",
      [bidId, carId]
    );
    if (bidRows.length === 0) return res.status(404).json({ message: "Bid not found" });

    const bid = bidRows[0];

    await db.query("UPDATE car_bids SET status = 'ACCEPTED' WHERE id = ?", [bidId]);
    await db.query("UPDATE car_bids SET status = 'REJECTED' WHERE car_id = ? AND id <> ? AND status IN ('PLACED', 'OUTBID')", [carId, bidId]);
    await db.query("UPDATE bidding_config SET is_enabled = FALSE WHERE car_id = ?", [carId]);
    await db.query("UPDATE cars SET status = 'UNDER_REVIEW' WHERE id = ?", [carId]);

    const orderNumber = createOrderNumber();
    await db.query(
      `INSERT INTO orders (buyer_id, car_id, seller_id, order_number, amount, currency, status, payment_status)
       VALUES (?, ?, ?, ?, ?, 'INR', 'PENDING', 'PENDING')
       ON DUPLICATE KEY UPDATE
         buyer_id = VALUES(buyer_id),
         amount = VALUES(amount),
         status = 'PENDING',
         payment_status = 'PENDING',
         updated_at = CURRENT_TIMESTAMP`,
      [bid.bidder_id, carId, carRows[0].seller_id, orderNumber, bid.bid_amount]
    );

    return res.json({ message: "Bid accepted and order draft created" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const rejectBid = async (req, res) => {
  try {
    const carId = Number(req.params.id);
    const bidId = Number(req.params.bidId);

    const [carRows] = await db.query("SELECT id, seller_id FROM cars WHERE id = ? AND deleted_at IS NULL", [carId]);
    if (carRows.length === 0) return res.status(404).json({ message: "Car not found" });

    const userRole = String(req.user.role || "").toUpperCase();
    if (carRows[0].seller_id !== req.user.id && userRole !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [result] = await db.query(
      "UPDATE car_bids SET status = 'REJECTED' WHERE id = ? AND car_id = ?",
      [bidId, carId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Bid not found" });
    return res.json({ message: "Bid rejected" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  upsertBiddingConfig,
  placeBid,
  getBidsByCar,
  acceptBid,
  rejectBid,
};
