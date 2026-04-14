const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getMyVerification,
  upsertMyVerification,
  getAllVerifications,
  updateVerificationStatus,
} = require("../controllers/sellerVerificationController");

router.get("/me", verifyToken, authorizeRoles("seller"), getMyVerification);
router.post("/me", verifyToken, authorizeRoles("seller"), upsertMyVerification);
router.get("/", verifyToken, authorizeRoles("admin"), getAllVerifications);
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateVerificationStatus);

module.exports = router;