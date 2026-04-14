const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getMySellerProfile,
  upsertMySellerProfile,
  getMyBuyerProfile,
  upsertMyBuyerProfile,
} = require("../controllers/profileController");

router.get("/seller/me", verifyToken, authorizeRoles("seller", "admin"), getMySellerProfile);
router.put("/seller/me", verifyToken, authorizeRoles("seller", "admin"), upsertMySellerProfile);
router.get("/buyer/me", verifyToken, authorizeRoles("buyer", "admin"), getMyBuyerProfile);
router.put("/buyer/me", verifyToken, authorizeRoles("buyer", "admin"), upsertMyBuyerProfile);

module.exports = router;