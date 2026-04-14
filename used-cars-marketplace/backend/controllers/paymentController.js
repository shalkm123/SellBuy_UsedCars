const db = require("../config/db");

const makeOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

const createOrderIfNeeded = async (buyerId, carId, currency = "INR") => {
  const [existingOrders] = await db.query("SELECT * FROM orders WHERE car_id = ?", [carId]);
  if (existingOrders.length > 0) {
    if (existingOrders[0].buyer_id !== buyerId) {
      return null;
    }
    return existingOrders[0];
  }

  const [carRows] = await db.query(
    "SELECT id, seller_id, price FROM cars WHERE id = ? AND deleted_at IS NULL AND status = 'ACTIVE'",
    [carId]
  );
  if (carRows.length === 0) {
    return null;
  }

  const car = carRows[0];
  const [result] = await db.query(
    "INSERT INTO orders (buyer_id, car_id, seller_id, order_number, amount, currency, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [buyerId, car.id, car.seller_id, makeOrderNumber(), car.price, currency, "PENDING", "PENDING"]
  );

  const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [result.insertId]);
  return orders[0];
};

// POST /payments
const createPayment = async (req, res) => {
  const { order_id, car_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method, currency } = req.body;
  if (!order_id && !car_id) return res.status(400).json({ message: "order_id or car_id is required" });
  try {
    let order = null;
    if (order_id) {
      const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [order_id]);
      order = orders[0] || null;
      if (order && String(req.user.role).toUpperCase() !== "ADMIN" && order.buyer_id !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else {
      order = await createOrderIfNeeded(req.user.id, car_id, currency || "INR");
    }

    if (!order) {
      return res.status(404).json({ message: "Order or car not available" });
    }

    const effectiveStatus = razorpay_payment_id && razorpay_signature ? "SUCCESS" : "CREATED";
    const effectiveRazorpayOrderId = razorpay_order_id || order.order_number;
    await db.query(
      `INSERT INTO payments (
        order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_method, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        razorpay_order_id = VALUES(razorpay_order_id),
        razorpay_payment_id = VALUES(razorpay_payment_id),
        razorpay_signature = VALUES(razorpay_signature),
        amount = VALUES(amount),
        currency = VALUES(currency),
        status = VALUES(status),
        payment_method = VALUES(payment_method),
        paid_at = VALUES(paid_at),
        updated_at = CURRENT_TIMESTAMP`,
      [order.id, effectiveRazorpayOrderId, razorpay_payment_id || null, razorpay_signature || null, order.amount, currency || order.currency || "INR", effectiveStatus, payment_method || null, effectiveStatus === "SUCCESS" ? new Date() : null]
    );

    const [[paymentRow]] = await db.query("SELECT * FROM payments WHERE order_id = ?", [order.id]);

    if (effectiveStatus === "SUCCESS") {
      await db.query("UPDATE orders SET status = 'PAID', payment_status = 'SUCCESS' WHERE id = ?", [order.id]);
      await db.query("UPDATE cars SET status = 'SOLD' WHERE id = ?", [order.car_id]);
    } else {
      await db.query("UPDATE orders SET payment_status = 'PENDING' WHERE id = ?", [order.id]);
    }

    res.status(201).json({
      message: "Payment successful",
      paymentId: paymentRow.id,
      orderId: order.id,
      razorpay_order_id: effectiveRazorpayOrderId,
      amount: order.amount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /payments/verify
const verifyPayment = async (req, res) => {
  const { order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "order_id, razorpay_payment_id and razorpay_signature are required" });
  }
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [order_id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (String(req.user.role).toUpperCase() !== "ADMIN" && orders[0].buyer_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [payments] = await db.query("SELECT * FROM payments WHERE order_id = ?", [order_id]);
    if (payments.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    await db.query(
      "UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'VERIFIED', paid_at = NOW() WHERE order_id = ?",
      [razorpay_payment_id, razorpay_signature, order_id]
    );
    await db.query("UPDATE orders SET status = 'PAID', payment_status = 'SUCCESS' WHERE id = ?", [order_id]);
    const [[order]] = await db.query("SELECT car_id FROM orders WHERE id = ?", [order_id]);
    if (order) {
      await db.query("UPDATE cars SET status = 'SOLD' WHERE id = ?", [order.car_id]);
    }
    res.json({ message: "Payment verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /payments/my — buyer's payment history
const getMyPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, o.order_number, o.status AS order_status, o.payment_status, c.title, c.brand, c.model_name, c.location_city, c.location_state,
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN cars c ON o.car_id = c.id
       WHERE o.buyer_id = ? ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name, city: row.location_city }))); 
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /payments — admin all payments
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, o.order_number, o.status AS order_status, o.payment_status,
        c.title AS car_title, c.brand, c.model_name, u.full_name AS buyer_name, u.email AS buyer_email
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       JOIN cars c ON o.car_id = c.id
       JOIN users u ON o.buyer_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { createPayment, verifyPayment, getMyPayments, getAllPayments };
