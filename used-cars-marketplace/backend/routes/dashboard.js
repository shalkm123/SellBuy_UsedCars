const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { buyerDashboard, sellerDashboard, adminDashboard } = require("../controllers/dashboardController");

router.get("/buyer", verifyToken, authorizeRoles("buyer"), buyerDashboard);
router.get("/seller", verifyToken, authorizeRoles("seller"), sellerDashboard);
router.get("/admin", verifyToken, authorizeRoles("admin"), adminDashboard);

module.exports = router;
