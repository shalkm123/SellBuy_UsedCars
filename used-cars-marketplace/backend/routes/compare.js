const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
	compareCars,
	getMyCompareList,
	addCompareItem,
	removeCompareItem,
	clearCompareItems,
} = require("../controllers/compareController");

router.post("/", compareCars);
router.get("/me", verifyToken, authorizeRoles("buyer", "seller", "admin"), getMyCompareList);
router.post("/items", verifyToken, authorizeRoles("buyer", "seller", "admin"), addCompareItem);
router.delete("/items/:carId", verifyToken, authorizeRoles("buyer", "seller", "admin"), removeCompareItem);
router.delete("/items", verifyToken, authorizeRoles("buyer", "seller", "admin"), clearCompareItems);

module.exports = router;
