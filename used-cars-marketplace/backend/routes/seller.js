const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getSellerNavStats,
  getSellerIncomingBids,
  getSellerMessages,
  getSellerAnalytics,
  updateSellerListingStatus,
} = require("../controllers/sellerController");

router.get("/nav-stats", verifyToken, authorizeRoles("seller"), getSellerNavStats);
router.get("/bids", verifyToken, authorizeRoles("seller"), getSellerIncomingBids);
router.get("/messages", verifyToken, authorizeRoles("seller"), getSellerMessages);
router.get("/analytics", verifyToken, authorizeRoles("seller"), getSellerAnalytics);
router.patch("/listings/:id/status", verifyToken, authorizeRoles("seller"), updateSellerListingStatus);

module.exports = router;
