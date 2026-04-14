const db = require("../config/db");

const getOrCreateWishlistId = async (buyerId) => {
  const [rows] = await db.query("SELECT id FROM wishlists WHERE buyer_id = ?", [buyerId]);
  if (rows.length > 0) return rows[0].id;
  const [result] = await db.query("INSERT INTO wishlists (buyer_id) VALUES (?)", [buyerId]);
  return result.insertId;
};

const getMyWishlist = async (req, res) => {
  try {
    const wishlistId = await getOrCreateWishlistId(req.user.id);
    const [items] = await db.query(
      `SELECT wi.id AS wishlist_item_id, wi.created_at, c.*, 
        (SELECT ci.image_url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.sort_order ASC, ci.id ASC LIMIT 1) AS image_url
       FROM wishlist_items wi
       JOIN cars c ON wi.car_id = c.id
       WHERE wi.wishlist_id = ? AND c.deleted_at IS NULL
       ORDER BY wi.created_at DESC`,
      [wishlistId]
    );
    res.json({ wishlistId, items: items.map((row) => ({ ...row, model: row.model_name, city: row.location_city, fuel: row.fuel_type })) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const addWishlistItem = async (req, res) => {
  const { car_id } = req.body;
  if (!car_id) return res.status(400).json({ message: "car_id is required" });
  try {
    const [cars] = await db.query("SELECT id FROM cars WHERE id = ? AND deleted_at IS NULL", [car_id]);
    if (cars.length === 0) return res.status(404).json({ message: "Car not found" });
    const wishlistId = await getOrCreateWishlistId(req.user.id);
    await db.query("INSERT IGNORE INTO wishlist_items (wishlist_id, car_id) VALUES (?, ?)", [wishlistId, car_id]);
    res.status(201).json({ message: "Car added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const removeWishlistItem = async (req, res) => {
  try {
    const wishlistId = await getOrCreateWishlistId(req.user.id);
    await db.query("DELETE FROM wishlist_items WHERE wishlist_id = ? AND car_id = ?", [wishlistId, req.params.carId]);
    res.json({ message: "Car removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getMyWishlist, addWishlistItem, removeWishlistItem };