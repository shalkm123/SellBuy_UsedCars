const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getBuyerNavStats,
  getBuyerMessages,
  getBuyerBids,
  getBuyerOffers,
} = require("../controllers/buyerController");

router.get("/nav-stats", verifyToken, authorizeRoles("buyer"), getBuyerNavStats);
router.get("/messages", verifyToken, authorizeRoles("buyer"), getBuyerMessages);
router.get("/bids", verifyToken, authorizeRoles("buyer"), getBuyerBids);
router.get("/offers", verifyToken, authorizeRoles("buyer"), getBuyerOffers);

module.exports = router;