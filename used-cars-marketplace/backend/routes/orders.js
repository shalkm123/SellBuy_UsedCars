const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { createOrder, getMyOrders, getSellerOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

router.post("/", verifyToken, authorizeRoles("buyer"), createOrder);
router.get("/my", verifyToken, authorizeRoles("buyer"), getMyOrders);
router.get("/seller/my", verifyToken, authorizeRoles("seller"), getSellerOrders);
router.get("/", verifyToken, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status", verifyToken, authorizeRoles("admin", "seller"), updateOrderStatus);

module.exports = router;