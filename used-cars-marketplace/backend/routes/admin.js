const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getApprovals,
  approveListing,
  rejectListing,
  getFraudAlerts,
  getAdminUsers,
  getAdminListings,
  updateAdminListingStatus,
  getRevenueOverview,
  getAdminSettings,
  updateAdminSettings,
  getAuditLog,
  getAdminMessages,
  getAdminNavStats,
} = require("../controllers/adminController");

router.use(verifyToken, authorizeRoles("admin"));

router.get("/approvals", getApprovals);
router.post("/approvals/:carId/approve", approveListing);
router.post("/approvals/:carId/reject", rejectListing);

router.get("/fraud-alerts", getFraudAlerts);

router.get("/users", getAdminUsers);

router.get("/listings", getAdminListings);
router.patch("/listings/:carId/status", updateAdminListingStatus);

router.get("/revenue", getRevenueOverview);

router.get("/messages", getAdminMessages);
router.get("/nav-stats", getAdminNavStats);

router.get("/settings", getAdminSettings);
router.put("/settings", updateAdminSettings);

router.get("/audit", getAuditLog);

module.exports = router;
