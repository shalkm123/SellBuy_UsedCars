const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { getMyWishlist, addWishlistItem, removeWishlistItem } = require("../controllers/wishlistController");

router.get("/me", verifyToken, authorizeRoles("buyer"), getMyWishlist);
router.post("/items", verifyToken, authorizeRoles("buyer"), addWishlistItem);
router.delete("/items/:carId", verifyToken, authorizeRoles("buyer"), removeWishlistItem);

module.exports = router;