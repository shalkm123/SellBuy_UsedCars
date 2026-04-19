const db = require("../config/db");
const { createAdminAuditLog } = require("../utils/adminAudit");

const currentYear = new Date().getFullYear();

const normalizeStatus = (value, fallback) => {
  const status = String(value || fallback || "").toUpperCase();
  return status;
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  return Boolean(value);
};

const getPrimaryImageSubquery = `(
  SELECT ci.image_url
  FROM car_images ci
  WHERE ci.car_id = c.id
  ORDER BY ci.sort_order ASC, ci.id ASC
  LIMIT 1
) AS image_url`;

// GET /cars — browse with filters
const getAllCars = async (req, res) => {
  const { brand, model_name, fuel_type, transmission, min_price, max_price, location_city, status, search } = req.query;
  let query = `SELECT c.*, u.full_name AS seller_name, u.email AS seller_email, u.phone_number AS seller_phone, ${getPrimaryImageSubquery}
              FROM cars c JOIN users u ON c.seller_id = u.id
              WHERE c.deleted_at IS NULL`;
  const params = [];

  query += ` AND c.status = ?`;
  params.push(normalizeStatus(status, "ACTIVE"));

  if (brand) { query += " AND c.brand = ?"; params.push(brand); }
  if (model_name) { query += " AND c.model_name = ?"; params.push(model_name); }
  if (fuel_type) { query += " AND c.fuel_type = ?"; params.push(normalizeStatus(fuel_type)); }
  if (transmission) { query += " AND c.transmission = ?"; params.push(normalizeStatus(transmission)); }
  if (min_price) { query += " AND c.price >= ?"; params.push(min_price); }
  if (max_price) { query += " AND c.price <= ?"; params.push(max_price); }
  if (location_city) { query += " AND c.location_city = ?"; params.push(location_city); }
  if (search) { query += " AND (c.title LIKE ? OR c.brand LIKE ? OR c.model_name LIKE ?)"; const s = `%${search}%`; params.push(s, s, s); }

  query += " ORDER BY c.created_at DESC";

  try {
    const [rows] = await db.query(query, params);
    res.json(rows.map((row) => ({ ...row, model: row.model_name, city: row.location_city, fuel: row.fuel_type })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /cars/:id
const getCarById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT c.*, u.full_name AS seller_name, u.phone_number AS seller_phone, u.email AS seller_email FROM cars c JOIN users u ON c.seller_id = u.id WHERE c.id = ? AND c.deleted_at IS NULL",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    const [images] = await db.query(
      "SELECT id, image_url, public_id, sort_order, created_at FROM car_images WHERE car_id = ? ORDER BY sort_order ASC, id ASC",
      [req.params.id]
    );
    const [trustFactors] = await db.query(
      `SELECT factor_key, factor_label, factor_value, impact_score, explanation
       FROM car_trust_factors
       WHERE car_id = ?
       ORDER BY id ASC`,
      [req.params.id]
    );
    const [emiRows] = await db.query(
      `SELECT principal, annual_interest_rate, tenure_months, monthly_emi, total_interest, total_payable, calculated_at
       FROM car_emi_quotes
       WHERE car_id = ?
       LIMIT 1`,
      [req.params.id]
    );

    res.json({
      ...rows[0],
      images,
      trust_factors: trustFactors,
      emi_quote: emiRows[0] || null,
      model: rows[0].model_name,
      city: rows[0].location_city,
      fuel: rows[0].fuel_type,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCarEmiQuote = async (req, res) => {
  try {
    const [cars] = await db.query("SELECT id FROM cars WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (cars.length === 0) return res.status(404).json({ message: "Car not found" });

    const [rows] = await db.query(
      `SELECT principal, annual_interest_rate, tenure_months, monthly_emi, total_interest, total_payable, calculated_at
       FROM car_emi_quotes
       WHERE car_id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "EMI quote not available" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const enqueueTrustScoreRecompute = async (req, res) => {
  try {
    const [cars] = await db.query("SELECT id FROM cars WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (cars.length === 0) return res.status(404).json({ message: "Car not found" });

    const [result] = await db.query(
      "INSERT INTO trust_score_jobs (car_id, reason, status) VALUES (?, 'MANUAL_RECOMPUTE', 'PENDING')",
      [req.params.id]
    );

    res.status(202).json({ message: "Trust score recompute queued", jobId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /cars — seller adds listing
const addCar = async (req, res) => {
  const {
    title,
    brand,
    model_name,
    variant,
    manufacturing_year,
    car_age_years,
    price,
    condition,
    car_condition,
    kilometers_driven,
    transmission,
    fuel_type,
    color,
    location_city,
    location_state,
    ownership,
    seats,
    description,
    status,
    is_featured,
  } = req.body;

  const effectiveCondition = car_condition || condition;

  if (!title || !brand || !model_name || !manufacturing_year || !price || !effectiveCondition || !kilometers_driven || !transmission || !fuel_type || !color || !location_city || !location_state || !ownership || !seats) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const ageYears = car_age_years !== undefined && car_age_years !== null
    ? Number(car_age_years)
    : Math.max(currentYear - Number(manufacturing_year), 0);
  const carStatus = normalizeStatus(status, "UNDER_REVIEW");
  try {
    const warnings = [];
    if (req.uploadWarning) warnings.push(req.uploadWarning);

    const [result] = await db.query(
      `INSERT INTO cars (
        seller_id, title, brand, model_name, variant, manufacturing_year, car_age_years, price, car_condition,
        kilometers_driven, transmission, fuel_type, color, location_city, location_state, ownership, seats,
        description, status, is_featured
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id,
        title,
        brand,
        model_name,
        variant || null,
        manufacturing_year,
        ageYears,
        price,
        normalizeStatus(effectiveCondition),
        kilometers_driven,
        normalizeStatus(transmission),
        normalizeStatus(fuel_type),
        color,
        location_city,
        location_state,
        normalizeStatus(ownership),
        seats,
        description || null,
        carStatus,
        parseBoolean(is_featured),
      ]
    );

    if (req.file) {
      try {
        await db.query(
          "INSERT INTO car_images (car_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)",
          [result.insertId, `/uploads/${req.file.filename}`, req.file.filename, 1]
        );
      } catch {
        warnings.push("Image metadata could not be saved, but listing data was saved.");
      }
    }

    res.status(201).json({ message: "Car listing submitted for review", carId: result.insertId, warnings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /cars/:id — seller updates own listing
const updateCar = async (req, res) => {
  try {
    const warnings = [];
    if (req.uploadWarning) warnings.push(req.uploadWarning);

    const [rows] = await db.query("SELECT * FROM cars WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    if (rows[0].seller_id !== req.user.id && String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedFields = {
      title: req.body.title ?? rows[0].title,
      brand: req.body.brand ?? rows[0].brand,
      model_name: req.body.model_name ?? rows[0].model_name,
      variant: req.body.variant ?? rows[0].variant,
      manufacturing_year: req.body.manufacturing_year ?? rows[0].manufacturing_year,
      car_age_years: req.body.car_age_years ?? rows[0].car_age_years,
      price: req.body.price ?? rows[0].price,
      car_condition: normalizeStatus(req.body.car_condition || req.body.condition, rows[0].car_condition),
      kilometers_driven: req.body.kilometers_driven ?? rows[0].kilometers_driven,
      transmission: normalizeStatus(req.body.transmission, rows[0].transmission),
      fuel_type: normalizeStatus(req.body.fuel_type, rows[0].fuel_type),
      color: req.body.color ?? rows[0].color,
      location_city: req.body.location_city ?? rows[0].location_city,
      location_state: req.body.location_state ?? rows[0].location_state,
      ownership: normalizeStatus(req.body.ownership, rows[0].ownership),
      seats: req.body.seats ?? rows[0].seats,
      description: req.body.description ?? rows[0].description,
      status: normalizeStatus(req.body.status, rows[0].status),
      is_featured: req.body.is_featured !== undefined ? Boolean(req.body.is_featured) : Boolean(rows[0].is_featured),
    };

    await db.query(
      `UPDATE cars SET
        title=?, brand=?, model_name=?, variant=?, manufacturing_year=?, car_age_years=?, price=?, car_condition=?,
        kilometers_driven=?, transmission=?, fuel_type=?, color=?, location_city=?, location_state=?, ownership=?,
        seats=?, description=?, status=?, is_featured=?
       WHERE id=?`,
      [
        updatedFields.title,
        updatedFields.brand,
        updatedFields.model_name,
        updatedFields.variant,
        updatedFields.manufacturing_year,
        updatedFields.car_age_years,
        updatedFields.price,
        updatedFields.car_condition,
        updatedFields.kilometers_driven,
        updatedFields.transmission,
        updatedFields.fuel_type,
        updatedFields.color,
        updatedFields.location_city,
        updatedFields.location_state,
        updatedFields.ownership,
        updatedFields.seats,
        updatedFields.description,
        updatedFields.status,
        updatedFields.is_featured,
        req.params.id,
      ]
    );

    if (req.file) {
      try {
        const [imageRows] = await db.query(
          "SELECT id FROM car_images WHERE car_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1",
          [req.params.id]
        );
        if (imageRows.length > 0) {
          await db.query(
            "UPDATE car_images SET image_url = ?, public_id = ? WHERE id = ?",
            [`/uploads/${req.file.filename}`, req.file.filename, imageRows[0].id]
          );
        } else {
          await db.query(
            "INSERT INTO car_images (car_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)",
            [req.params.id, `/uploads/${req.file.filename}`, req.file.filename, 1]
          );
        }
      } catch {
        warnings.push("Image metadata could not be updated, but listing data was saved.");
      }
    }

    res.json({ message: "Car updated successfully", warnings });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /cars/:id
const deleteCar = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cars WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });
    if (rows[0].seller_id !== req.user.id && String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }
    await db.query("UPDATE cars SET deleted_at = NOW(), status = 'INACTIVE' WHERE id = ?", [req.params.id]);
    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /cars/:id/status — admin approves/rejects
const updateCarStatus = async (req, res) => {
  const status = normalizeStatus(req.body.status);
  const allowed = ["DRAFT", "ACTIVE", "SOLD", "INACTIVE", "UNDER_REVIEW"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const [rows] = await db.query("SELECT status FROM cars WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Car not found" });

    await db.query("UPDATE cars SET status = ? WHERE id = ?", [status, req.params.id]);

    if (String(req.user?.role || "").toUpperCase() === "ADMIN") {
      await createAdminAuditLog({
        actorUserId: req.user.id,
        actionType: "CAR_STATUS_UPDATED",
        targetType: "CAR",
        targetId: Number(req.params.id),
        metadata: { previousStatus: rows[0].status, nextStatus: status },
      });
    }

    res.json({ message: `Car status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /cars/seller/my-listings — seller's own cars
const getMyListings = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, 
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
       FROM cars c WHERE c.seller_id = ? AND c.deleted_at IS NULL ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((row) => ({ ...row, model: row.model_name, city: row.location_city, fuel: row.fuel_type })));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getCarImages = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, image_url, public_id, sort_order, created_at FROM car_images WHERE car_id = ? ORDER BY sort_order ASC, id ASC",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addCarImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }
  try {
    const [cars] = await db.query("SELECT seller_id FROM cars WHERE id = ? AND deleted_at IS NULL", [req.params.id]);
    if (cars.length === 0) return res.status(404).json({ message: "Car not found" });
    if (cars[0].seller_id !== req.user.id && String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const sortOrder = req.body.sort_order ? Number(req.body.sort_order) : null;
    let finalSortOrder = sortOrder;
    if (!finalSortOrder) {
      const [sortRows] = await db.query(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM car_images WHERE car_id = ?",
        [req.params.id]
      );
      finalSortOrder = sortRows[0].next_sort_order;
    }
    const [result] = await db.query(
      "INSERT INTO car_images (car_id, image_url, public_id, sort_order) VALUES (?, ?, ?, ?)",
      [req.params.id, `/uploads/${req.file.filename}`, req.file.filename, finalSortOrder]
    );
    res.status(201).json({ message: "Car image added", imageId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteCarImage = async (req, res) => {
  try {
    const [images] = await db.query(
      `SELECT ci.id, c.seller_id
       FROM car_images ci JOIN cars c ON ci.car_id = c.id
       WHERE ci.id = ?`,
      [req.params.imageId]
    );
    if (images.length === 0) return res.status(404).json({ message: "Image not found" });
    if (images[0].seller_id !== req.user.id && String(req.user.role).toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }
    await db.query("DELETE FROM car_images WHERE id = ?", [req.params.imageId]);
    res.json({ message: "Car image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getAllCars,
  getCarById,
  getCarEmiQuote,
  enqueueTrustScoreRecompute,
  addCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  getMyListings,
  getCarImages,
  addCarImage,
  deleteCarImage,
};
