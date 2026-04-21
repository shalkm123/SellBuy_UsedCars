const db = require("../config/db");
const { createAdminAuditLog } = require("../utils/adminAudit");

const hasTable = async (tableName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName]
  );
  return rows.length > 0;
};

const hasColumn = async (tableName, columnName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
};

const pickColumn = async (tableName, options) => {
  for (const column of options) {
    // eslint-disable-next-line no-await-in-loop
    if (await hasColumn(tableName, column)) return column;
  }
  return null;
};

const getApprovals = async (req, res) => {
  try {
    const modelCol = await pickColumn("cars", ["model_name", "model"]);
    const cityCol = await pickColumn("cars", ["location_city", "city"]);
    const stateCol = await pickColumn("cars", ["location_state", "state"]);
    const trustScoreExists = await hasColumn("cars", "trust_score");
    const trustBandExists = await hasColumn("cars", "trust_band");
    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const sellerPhoneCol = await pickColumn("users", ["phone_number", "phone"]);

    const hasSellerVerification = await hasTable("seller_verification");
    const hasSellerVerificationStatus = hasSellerVerification && (await hasColumn("seller_verification", "verification_status"));
    const hasSellerVerificationUserRef = hasSellerVerification && (await hasColumn("seller_verification", "user_id"));

    const hasCarImages = await hasTable("car_images");
    const hasSortOrder = hasCarImages && (await hasColumn("car_images", "sort_order"));

    const modelExpr = modelCol ? `c.${modelCol}` : `''`;
    const cityExpr = cityCol ? `c.${cityCol}` : `''`;
    const stateExpr = stateCol ? `c.${stateCol}` : `''`;
    const trustScoreExpr = trustScoreExists ? `c.trust_score` : `NULL`;
    const trustBandExpr = trustBandExists ? `c.trust_band` : `'PENDING'`;
    const sellerPhoneExpr = sellerPhoneCol ? `u.${sellerPhoneCol}` : `''`;
    const verificationExpr = hasSellerVerificationStatus ? `sv.verification_status` : `'PENDING'`;
    const imageExpr = hasCarImages
      ? `(SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ${hasSortOrder ? "ci.sort_order ASC, " : ""}ci.id ASC LIMIT 1)`
      : `NULL`;

    const joinVerification = hasSellerVerificationUserRef ? `LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id` : ``;
    const deletedClause = deletedAtExists ? `c.deleted_at IS NULL` : `1=1`;

    const [rows] = await db.query(
      `SELECT c.id, c.title, c.brand, ${modelExpr} AS model_name, c.price, c.status, c.created_at,
              ${trustScoreExpr} AS trust_score, ${trustBandExpr} AS trust_band,
              ${cityExpr} AS location_city, ${stateExpr} AS location_state,
              u.id AS seller_id, u.full_name AS seller_name, u.email AS seller_email, ${sellerPhoneExpr} AS seller_phone,
              ${verificationExpr} AS verification_status,
              ${imageExpr} AS image_url
       FROM cars c
       JOIN users u ON c.seller_id = u.id
       ${joinVerification}
       WHERE ${deletedClause}
         AND c.status = 'UNDER_REVIEW'
       ORDER BY c.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load approvals", error: err.message });
  }
};

const approveListing = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (!carId) return res.status(400).json({ message: "Invalid car id" });

    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const updatedAtExists = await hasColumn("cars", "updated_at");
    const listWhere = deletedAtExists ? "id = ? AND deleted_at IS NULL" : "id = ?";

    const [cars] = await db.query(`SELECT id, status FROM cars WHERE ${listWhere}`, [carId]);
    if (cars.length === 0) return res.status(404).json({ message: "Listing not found" });

    const updateSql = updatedAtExists
      ? "UPDATE cars SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      : "UPDATE cars SET status = 'ACTIVE' WHERE id = ?";
    await db.query(updateSql, [carId]);
    await createAdminAuditLog({
      actorUserId: req.user.id,
      actionType: "LISTING_APPROVED",
      targetType: "CAR",
      targetId: carId,
      metadata: { previousStatus: cars[0].status, nextStatus: "ACTIVE" },
    });

    res.json({ message: "Listing approved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve listing", error: err.message });
  }
};

const rejectListing = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    const reason = String(req.body.reason || "Rejected by admin").slice(0, 500);
    if (!carId) return res.status(400).json({ message: "Invalid car id" });

    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const updatedAtExists = await hasColumn("cars", "updated_at");
    const listWhere = deletedAtExists ? "id = ? AND deleted_at IS NULL" : "id = ?";

    const [cars] = await db.query(`SELECT id, status FROM cars WHERE ${listWhere}`, [carId]);
    if (cars.length === 0) return res.status(404).json({ message: "Listing not found" });

    const updateSql = updatedAtExists
      ? "UPDATE cars SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      : "UPDATE cars SET status = 'INACTIVE' WHERE id = ?";
    await db.query(updateSql, [carId]);
    await createAdminAuditLog({
      actorUserId: req.user.id,
      actionType: "LISTING_REJECTED",
      targetType: "CAR",
      targetId: carId,
      metadata: { previousStatus: cars[0].status, nextStatus: "INACTIVE", reason },
    });

    res.json({ message: "Listing rejected" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reject listing", error: err.message });
  }
};

const getFraudAlerts = async (req, res) => {
  try {
    const trustScoreExists = await hasColumn("cars", "trust_score");
    const trustBandExists = await hasColumn("cars", "trust_band");
    const updatedAtExists = await hasColumn("cars", "updated_at");
    const deletedAtExists = await hasColumn("cars", "deleted_at");

    const hasSellerVerification = await hasTable("seller_verification");
    const hasSellerVerificationStatus = hasSellerVerification && (await hasColumn("seller_verification", "verification_status"));
    const hasSellerVerificationUserRef = hasSellerVerification && (await hasColumn("seller_verification", "user_id"));

    const verificationExpr = hasSellerVerificationStatus ? `sv.verification_status` : `'PENDING'`;
    const joinVerification = hasSellerVerificationUserRef ? `LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id` : ``;

    const fraudConditions = [];
    if (trustBandExists) fraudConditions.push(`c.trust_band = 'LOW'`);
    if (trustScoreExists) fraudConditions.push(`(c.trust_score IS NOT NULL AND c.trust_score < 40)`);
    if (hasSellerVerificationStatus) fraudConditions.push(`sv.verification_status = 'REJECTED'`);
    if (fraudConditions.length === 0) fraudConditions.push(`c.status = 'UNDER_REVIEW'`);

    const deletedClause = deletedAtExists ? `c.deleted_at IS NULL` : `1=1`;
    const orderBy = updatedAtExists ? `c.updated_at DESC, c.created_at DESC` : `c.created_at DESC`;

    const [rows] = await db.query(
      `SELECT c.id AS car_id, c.title, c.price, c.status,
              ${trustScoreExists ? "c.trust_score" : "NULL AS trust_score"},
              ${trustBandExists ? "c.trust_band" : "'PENDING' AS trust_band"},
              c.created_at, u.id AS seller_id, u.full_name AS seller_name,
              ${verificationExpr} AS verification_status
       FROM cars c
       JOIN users u ON u.id = c.seller_id
       ${joinVerification}
       WHERE ${deletedClause}
         AND c.status IN ('UNDER_REVIEW', 'ACTIVE')
         AND (${fraudConditions.join(" OR ")})
       ORDER BY ${orderBy}
       LIMIT 100`
    );

    const alerts = rows.map((row) => {
      let severity = "LOW";
      let reason = "Low trust score";

      if (row.verification_status === "REJECTED") {
        severity = "HIGH";
        reason = "Seller verification is rejected";
      } else if (Number(row.trust_score || 0) < 20) {
        severity = "HIGH";
        reason = "Very low trust score";
      } else if (Number(row.trust_score || 0) < 40 || row.trust_band === "LOW") {
        severity = "MEDIUM";
        reason = "Below safe trust threshold";
      }

      return {
        id: `${row.car_id}-${severity}`,
        severity,
        reason,
        listing: {
          id: row.car_id,
          title: row.title,
          status: row.status,
          trust_score: row.trust_score,
          trust_band: row.trust_band,
          price: row.price,
        },
        seller: {
          id: row.seller_id,
          name: row.seller_name,
          verification_status: row.verification_status || "PENDING",
        },
        created_at: row.created_at,
      };
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Failed to load fraud alerts", error: err.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, full_name, email, phone_number, city, state, role, is_verified, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    const [[counts]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(role = 'BUYER') AS buyers,
         SUM(role = 'SELLER') AS sellers,
         SUM(role = 'ADMIN') AS admins,
         SUM(is_verified = TRUE) AS verified_users
       FROM users`
    );

    res.json({ counts, users: rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to load users", error: err.message });
  }
};

const getAdminListings = async (req, res) => {
  try {
    const modelCol = await pickColumn("cars", ["model_name", "model"]);
    const cityCol = await pickColumn("cars", ["location_city", "city"]);
    const stateCol = await pickColumn("cars", ["location_state", "state"]);
    const trustScoreExists = await hasColumn("cars", "trust_score");
    const trustBandExists = await hasColumn("cars", "trust_band");
    const updatedAtExists = await hasColumn("cars", "updated_at");
    const deletedAtExists = await hasColumn("cars", "deleted_at");

    const hasCarImages = await hasTable("car_images");
    const hasSortOrder = hasCarImages && (await hasColumn("car_images", "sort_order"));

    const status = String(req.query.status || "").toUpperCase();
    const valid = ["DRAFT", "ACTIVE", "SOLD", "INACTIVE", "UNDER_REVIEW"];
    const filters = [];
    const params = [];

    const deletedClause = deletedAtExists ? `c.deleted_at IS NULL` : `1=1`;
    filters.push(deletedClause);

    if (status && valid.includes(status)) {
      filters.push("c.status = ?");
      params.push(status);
    }

    const modelExpr = modelCol ? `c.${modelCol}` : `''`;
    const cityExpr = cityCol ? `c.${cityCol}` : `''`;
    const stateExpr = stateCol ? `c.${stateCol}` : `''`;
    const imageExpr = hasCarImages
      ? `(SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ${hasSortOrder ? "ci.sort_order ASC, " : ""}ci.id ASC LIMIT 1)`
      : `NULL`;

    const whereClause = filters.length > 0 ? `${filters.join(" AND ")}` : "1=1";

    const [rows] = await db.query(
      `SELECT c.id, c.title, c.brand, ${modelExpr} AS model_name, c.price, c.status,
              ${trustScoreExists ? "c.trust_score" : "NULL AS trust_score"},
              ${trustBandExists ? "c.trust_band" : "'PENDING' AS trust_band"},
              ${cityExpr} AS location_city, ${stateExpr} AS location_state,
              c.created_at, ${updatedAtExists ? "c.updated_at" : "c.created_at AS updated_at"},
              u.id AS seller_id, u.full_name AS seller_name, u.email AS seller_email,
              ${imageExpr} AS image_url
       FROM cars c
       JOIN users u ON u.id = c.seller_id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load listings", error: err.message });
  }
};

const updateAdminListingStatus = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    const status = String(req.body.status || "").toUpperCase();
    const valid = ["DRAFT", "ACTIVE", "SOLD", "INACTIVE", "UNDER_REVIEW"];

    if (!carId) return res.status(400).json({ message: "Invalid car id" });
    if (!valid.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const updatedAtExists = await hasColumn("cars", "updated_at");
    const listWhere = deletedAtExists ? "id = ? AND deleted_at IS NULL" : "id = ?";

    const [rows] = await db.query(`SELECT status FROM cars WHERE ${listWhere}`, [carId]);
    if (rows.length === 0) return res.status(404).json({ message: "Listing not found" });

    const updateSql = updatedAtExists
      ? "UPDATE cars SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      : "UPDATE cars SET status = ? WHERE id = ?";
    await db.query(updateSql, [status, carId]);
    await createAdminAuditLog({
      actorUserId: req.user.id,
      actionType: "LISTING_STATUS_UPDATED",
      targetType: "CAR",
      targetId: carId,
      metadata: { previousStatus: rows[0].status, nextStatus: status },
    });

    res.json({ message: "Listing status updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing status", error: err.message });
  }
};

const getRevenueOverview = async (req, res) => {
  try {
    const [[summary]] = await db.query(
      `SELECT COUNT(*) AS total_transactions,
              COALESCE(SUM(amount), 0) AS total_revenue,
              COALESCE(AVG(amount), 0) AS average_ticket
       FROM payments
       WHERE status IN ('SUCCESS', 'VERIFIED')`
    );

    const [monthly] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COALESCE(SUM(amount), 0) AS revenue,
              COUNT(*) AS transaction_count
       FROM payments
       WHERE status IN ('SUCCESS', 'VERIFIED')
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`
    );

    const [recent] = await db.query(
      `SELECT p.id, p.amount, p.currency, p.status, p.created_at,
              o.order_number, c.title AS car_title,
              buyer.full_name AS buyer_name,
              seller.full_name AS seller_name
       FROM payments p
       JOIN orders o ON o.id = p.order_id
       JOIN cars c ON c.id = o.car_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users seller ON seller.id = o.seller_id
       WHERE p.status IN ('SUCCESS', 'VERIFIED')
       ORDER BY p.created_at DESC
       LIMIT 20`
    );

    res.json({ summary, monthly, recent_transactions: recent });
  } catch (err) {
    res.status(500).json({ message: "Failed to load revenue overview", error: err.message });
  }
};

const ensureDefaultSettings = async () => {
  await db.query(
    `INSERT INTO admin_settings (setting_key, setting_value, description)
     VALUES
      ('default_down_payment_percent', '20', 'Default down payment percent for EMI quote generation'),
      ('default_emi_interest_rate', '9.5', 'Default annual interest rate for EMI quote generation'),
      ('default_emi_tenure_months', '60', 'Default tenure (months) for EMI quote generation'),
      ('fraud_trust_score_threshold', '40', 'Trust score threshold for fraud alerting')
     ON DUPLICATE KEY UPDATE setting_key = setting_key`
  );
};

const getAdminSettings = async (req, res) => {
  try {
    await ensureDefaultSettings();
    const [rows] = await db.query(
      `SELECT id, setting_key, setting_value, description, updated_at
       FROM admin_settings
       ORDER BY setting_key ASC`
    );
    res.json(rows);
  } catch (err) {
    // Graceful fallback when table is not migrated.
    res.json([
      { setting_key: "default_down_payment_percent", setting_value: "20", description: "Default down payment percent for EMI quote generation" },
      { setting_key: "default_emi_interest_rate", setting_value: "9.5", description: "Default annual interest rate for EMI quote generation" },
      { setting_key: "default_emi_tenure_months", setting_value: "60", description: "Default tenure (months) for EMI quote generation" },
      { setting_key: "fraud_trust_score_threshold", setting_value: "40", description: "Trust score threshold for fraud alerting" },
    ]);
  }
};

const updateAdminSettings = async (req, res) => {
  try {
    const settings = Array.isArray(req.body.settings) ? req.body.settings : [];
    if (settings.length === 0) return res.status(400).json({ message: "settings array is required" });

    for (const item of settings) {
      const key = String(item.setting_key || "").trim();
      const value = String(item.setting_value ?? "").trim();
      if (!key) continue;
      await db.query(
        `INSERT INTO admin_settings (setting_key, setting_value, description, updated_by)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), description = COALESCE(VALUES(description), description), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP`,
        [key, value, item.description || null, req.user.id]
      );
    }

    await createAdminAuditLog({
      actorUserId: req.user.id,
      actionType: "ADMIN_SETTINGS_UPDATED",
      targetType: "SETTINGS",
      metadata: { updatedKeys: settings.map((s) => s.setting_key).filter(Boolean) },
    });

    res.json({ message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update settings", error: err.message });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.id, l.action_type, l.target_type, l.target_id, l.metadata_json, l.created_at,
              u.full_name AS actor_name, u.email AS actor_email
       FROM admin_audit_logs l
       LEFT JOIN users u ON u.id = l.actor_user_id
       ORDER BY l.created_at DESC
       LIMIT 200`
    );

    res.json(
      rows.map((row) => ({
        ...row,
        metadata: row.metadata_json ? JSON.parse(row.metadata_json) : null,
      }))
    );
  } catch {
    // Graceful fallback when table is not migrated.
    res.json([]);
  }
};

const getAdminMessages = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.message, i.status, i.created_at,
              buyer.id AS buyer_id, buyer.full_name AS buyer_name,
              seller.id AS seller_id, seller.full_name AS seller_name,
              c.id AS car_id, c.title AS car_title
       FROM inquiries i
       JOIN users buyer ON buyer.id = i.buyer_id
       JOIN cars c ON c.id = i.car_id
       JOIN users seller ON seller.id = c.seller_id
       ORDER BY i.created_at DESC
       LIMIT 200`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin messages", error: err.message });
  }
};

const getAdminNavStats = async (req, res) => {
  try {
    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const trustScoreExists = await hasColumn("cars", "trust_score");
    const trustBandExists = await hasColumn("cars", "trust_band");

    const hasSellerVerification = await hasTable("seller_verification");
    const hasSellerVerificationStatus = hasSellerVerification && (await hasColumn("seller_verification", "verification_status"));
    const hasSellerVerificationUserRef = hasSellerVerification && (await hasColumn("seller_verification", "user_id"));

    const hasInquiries = await hasTable("inquiries");

    const deletedClause = deletedAtExists ? "AND c.deleted_at IS NULL" : "";

    const [[approvalsRow]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM cars c
       WHERE c.status = 'UNDER_REVIEW' ${deletedClause}`
    );

    let fraudCount = 0;
    if (trustScoreExists || trustBandExists || hasSellerVerificationStatus) {
      const fraudConditions = [];
      if (trustBandExists) fraudConditions.push("c.trust_band = 'LOW'");
      if (trustScoreExists) fraudConditions.push("(c.trust_score IS NOT NULL AND c.trust_score < 40)");
      if (hasSellerVerificationStatus) fraudConditions.push("sv.verification_status = 'REJECTED'");

      const joinVerification = hasSellerVerificationUserRef ? "LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id" : "";
      const [fraudRows] = await db.query(
        `SELECT COUNT(*) AS count
         FROM cars c
         ${joinVerification}
         WHERE c.status IN ('UNDER_REVIEW', 'ACTIVE')
           ${deletedClause}
           AND (${fraudConditions.join(" OR ")})`
      );
      fraudCount = Number(fraudRows?.[0]?.count || 0);
    }

    let messagesCount = 0;
    if (hasInquiries) {
      const [[messagesRow]] = await db.query("SELECT COUNT(*) AS count FROM inquiries");
      messagesCount = Number(messagesRow?.count || 0);
    }

    const [[listingsRow]] = await db.query(
      `SELECT COUNT(*) AS count FROM cars c WHERE 1=1 ${deletedClause}`
    );
    const [[usersRow]] = await db.query("SELECT COUNT(*) AS count FROM users");

    res.json({
      approvals: Number(approvalsRow?.count || 0),
      fraud_alerts: fraudCount,
      messages: messagesCount,
      listings: Number(listingsRow?.count || 0),
      users: Number(usersRow?.count || 0),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin nav stats", error: err.message });
  }
};

module.exports = {
  getApprovals,
  approveListing,
  rejectListing,
  getFraudAlerts,
  getAdminUsers,
  getAdminListings,
  updateAdminListingStatus,
  getRevenueOverview,
  getAdminSettings,
  updateAdminSettings,
  getAuditLog,
  getAdminMessages,
  getAdminNavStats,
};
