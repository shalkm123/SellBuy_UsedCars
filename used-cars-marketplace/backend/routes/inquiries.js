const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { createInquiry, getInquiriesByCar, updateInquiryStatus } = require("../controllers/inquiryController");

router.post("/", verifyToken, authorizeRoles("buyer"), createInquiry);
router.get("/car/:car_id", verifyToken, authorizeRoles("seller", "admin"), getInquiriesByCar);
router.patch("/:id/status", verifyToken, authorizeRoles("seller", "admin"), updateInquiryStatus);

module.exports = router;
