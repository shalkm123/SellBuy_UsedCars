const db = require("../config/db");

const MAX_COMPARE_ITEMS = 3;

const getOrCreateCompareListId = async (userId) => {
  const [rows] = await db.query("SELECT id FROM compare_lists WHERE user_id = ? LIMIT 1", [userId]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await db.query("INSERT INTO compare_lists (user_id) VALUES (?)", [userId]);
  return result.insertId;
};

const ensureCompareTables = async (res) => {
  const hasLists = await hasTable("compare_lists");
  const hasItems = await hasTable("compare_list_items");
  if (!hasLists || !hasItems) {
    res.status(503).json({
      message: "Compare persistence tables are missing. Please apply latest backend/schema.sql migrations.",
    });
    return false;
  }
  return true;
};

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

const scoreCompare = (cars) => {
  const withScores = cars.map((car) => ({ ...car, points: 0 }));

  const bestPrice = Math.min(...withScores.map((c) => Number(c.price)));
  const bestYear = Math.max(...withScores.map((c) => Number(c.manufacturing_year)));
  const bestKm = Math.min(...withScores.map((c) => Number(c.kilometers_driven)));
  const bestTrust = Math.max(...withScores.map((c) => Number(c.trust_score || 0)));

  withScores.forEach((car) => {
    if (Number(car.price) === bestPrice) car.points += 2;
    if (Number(car.manufacturing_year) === bestYear) car.points += 2;
    if (Number(car.kilometers_driven) === bestKm) car.points += 2;
    if (Number(car.trust_score || 0) === bestTrust) car.points += 3;
    if (String(car.seller_verification_status || "").toUpperCase() === "APPROVED") car.points += 1;
  });

  withScores.sort((a, b) => b.points - a.points);
  return {
    bestOverall: withScores[0],
    bestBudget: withScores.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b)),
    bestReliability: withScores.reduce((a, b) => (Number(a.trust_score || 0) >= Number(b.trust_score || 0) ? a : b)),
  };
};

const compareCars = async (req, res) => {
  try {
    const carIds = Array.isArray(req.body.car_ids)
      ? req.body.car_ids
          .map((id) => String(id || "").trim())
          .filter((id) => /^\d+$/.test(id))
      : [];

    const uniqueIds = [...new Set(carIds)].slice(0, 3);

    if (uniqueIds.length < 2 || uniqueIds.length > 3) {
      return res.status(400).json({ message: "Provide 2 or 3 car_ids for comparison" });
    }

    const placeholders = uniqueIds.map(() => "?").join(",");

    const modelCol = await pickColumn("cars", ["model_name", "model"]);
    const deletedAtExists = await hasColumn("cars", "deleted_at");
    const trustScoreExists = await hasColumn("cars", "trust_score");
    const hasSellerVerification = await hasTable("seller_verification");
    const hasSellerVerificationStatus = hasSellerVerification && (await hasColumn("seller_verification", "verification_status"));
    const hasSellerVerificationUserRef = hasSellerVerification && (await hasColumn("seller_verification", "user_id"));

    const modelExpr = modelCol ? `c.${modelCol}` : `''`;
    const trustExpr = trustScoreExists ? `c.trust_score` : `NULL`;
    const verificationExpr = hasSellerVerificationStatus ? `COALESCE(sv.verification_status, 'PENDING')` : `'PENDING'`;
    const joinVerification = hasSellerVerificationUserRef ? `LEFT JOIN seller_verification sv ON sv.user_id = c.seller_id` : ``;
    const deletedClause = deletedAtExists ? `AND c.deleted_at IS NULL` : ``;

    const [rows] = await db.query(
      `SELECT c.id, c.title, c.brand, ${modelExpr} AS model_name, c.price, c.manufacturing_year, c.kilometers_driven,
              c.fuel_type, c.transmission, c.ownership, ${trustExpr} AS trust_score,
              ${verificationExpr} AS seller_verification_status
       FROM cars c
       ${joinVerification}
       WHERE c.id IN (${placeholders}) ${deletedClause}`,
      uniqueIds
    );

    if (rows.length !== uniqueIds.length) {
      return res.status(404).json({ message: "One or more cars were not found" });
    }

    const verdict = scoreCompare(rows);

    return res.json({
      cars: rows,
      verdict: {
        best_overall_car_id: verdict.bestOverall.id,
        best_budget_car_id: verdict.bestBudget.id,
        best_reliability_car_id: verdict.bestReliability.id,
        summary: `${verdict.bestOverall.title} is the best overall pick. ${verdict.bestBudget.title} is best for budget. ${verdict.bestReliability.title} has the strongest trust profile.`,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getMyCompareList = async (req, res) => {
  try {
    if (!(await ensureCompareTables(res))) return;
    const compareListId = await getOrCreateCompareListId(req.user.id);
    const [rows] = await db.query(
      `SELECT
        ci.id AS compare_item_id,
        ci.created_at AS added_at,
        c.id,
        c.title,
        c.brand,
        c.model_name,
        c.price,
        c.manufacturing_year,
        c.kilometers_driven,
        c.fuel_type,
        c.transmission,
        c.ownership,
        c.trust_score,
        c.location_city,
        (SELECT img.image_url FROM car_images img WHERE img.car_id = c.id ORDER BY img.sort_order ASC, img.id ASC LIMIT 1) AS image_url
       FROM compare_list_items ci
       JOIN cars c ON c.id = ci.car_id
       WHERE ci.compare_list_id = ?
         AND c.deleted_at IS NULL
       ORDER BY ci.created_at ASC`,
      [compareListId]
    );

    return res.json({
      compareListId,
      items: rows.map((row) => ({
        ...row,
        city: row.location_city,
        year: row.manufacturing_year,
        km: row.kilometers_driven,
      })),
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addCompareItem = async (req, res) => {
  const { car_id } = req.body;
  if (!car_id) return res.status(400).json({ message: "car_id is required" });

  try {
    if (!(await ensureCompareTables(res))) return;
    const [cars] = await db.query(
      "SELECT id FROM cars WHERE id = ? AND deleted_at IS NULL",
      [car_id]
    );
    if (cars.length === 0) return res.status(404).json({ message: "Car not found" });

    const compareListId = await getOrCreateCompareListId(req.user.id);
    const [[countRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM compare_list_items WHERE compare_list_id = ?",
      [compareListId]
    );

    const [existingRows] = await db.query(
      "SELECT id FROM compare_list_items WHERE compare_list_id = ? AND car_id = ? LIMIT 1",
      [compareListId, car_id]
    );
    if (existingRows.length > 0) {
      return res.json({ message: "Car already in compare list" });
    }

    if (Number(countRow?.total || 0) >= MAX_COMPARE_ITEMS) {
      return res.status(400).json({ message: `You can compare up to ${MAX_COMPARE_ITEMS} cars` });
    }

    await db.query(
      "INSERT INTO compare_list_items (compare_list_id, car_id) VALUES (?, ?)",
      [compareListId, car_id]
    );

    return res.status(201).json({ message: "Car added to compare list" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeCompareItem = async (req, res) => {
  try {
    if (!(await ensureCompareTables(res))) return;
    const compareListId = await getOrCreateCompareListId(req.user.id);
    await db.query(
      "DELETE FROM compare_list_items WHERE compare_list_id = ? AND car_id = ?",
      [compareListId, req.params.carId]
    );
    return res.json({ message: "Car removed from compare list" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const clearCompareItems = async (req, res) => {
  try {
    if (!(await ensureCompareTables(res))) return;
    const compareListId = await getOrCreateCompareListId(req.user.id);
    await db.query("DELETE FROM compare_list_items WHERE compare_list_id = ?", [compareListId]);
    return res.json({ message: "Compare list cleared" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  compareCars,
  getMyCompareList,
  addCompareItem,
  removeCompareItem,
  clearCompareItems,
};
