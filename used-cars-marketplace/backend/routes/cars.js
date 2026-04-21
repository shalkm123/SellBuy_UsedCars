const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getAllCars, getCarById, addCar, updateCar,
  deleteCar, updateCarStatus, getMyListings, getCarImages, addCarImage, deleteCarImage,
  getCarEmiQuote, enqueueTrustScoreRecompute
} = require("../controllers/carController");
const {
  upsertBiddingConfig,
  placeBid,
  getBidsByCar,
  acceptBid,
  rejectBid,
} = require("../controllers/bidController");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const tolerantUploadSingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      req.uploadWarning = "Image upload failed, listing data was saved without image.";
      req.file = null;
    }
    next();
  });
};

router.get("/", getAllCars);
router.get("/seller/my-listings", verifyToken, authorizeRoles("seller"), getMyListings);
router.get("/:id/images", getCarImages);
router.get("/:id/emi", getCarEmiQuote);
router.post("/:id/trust-score/recompute", verifyToken, authorizeRoles("admin"), enqueueTrustScoreRecompute);
router.put("/:id/bidding-config", verifyToken, authorizeRoles("seller", "admin"), upsertBiddingConfig);
router.post("/:id/bids", verifyToken, authorizeRoles("buyer", "admin"), placeBid);
router.get("/:id/bids", verifyToken, getBidsByCar);
router.post("/:id/bids/:bidId/accept", verifyToken, authorizeRoles("seller", "admin"), acceptBid);
router.post("/:id/bids/:bidId/reject", verifyToken, authorizeRoles("seller", "admin"), rejectBid);
router.post("/:id/images", verifyToken, authorizeRoles("seller", "admin"), upload.single("image"), addCarImage);
router.delete("/images/:imageId", verifyToken, authorizeRoles("seller", "admin"), deleteCarImage);
router.get("/:id", getCarById);
router.post("/", verifyToken, authorizeRoles("seller"), tolerantUploadSingle("image"), addCar);
router.put("/:id", verifyToken, authorizeRoles("seller", "admin"), tolerantUploadSingle("image"), updateCar);
router.delete("/:id", verifyToken, authorizeRoles("seller", "admin"), deleteCar);
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateCarStatus);

module.exports = router;
