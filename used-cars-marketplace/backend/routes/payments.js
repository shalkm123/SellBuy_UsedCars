const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { createPayment, getMyPayments, getAllPayments } = require("../controllers/paymentController");

router.post("/", verifyToken, authorizeRoles("buyer"), createPayment);
router.get("/my", verifyToken, authorizeRoles("buyer"), getMyPayments);
router.get("/", verifyToken, authorizeRoles("admin"), getAllPayments);

module.exports = router;
