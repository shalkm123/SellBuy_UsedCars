const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const {
  getAllCars, getCarById, addCar, updateCar,
  deleteCar, updateCarStatus, getMyListings, getCarImages, addCarImage, deleteCarImage
} = require("../controllers/carController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/", getAllCars);
router.get("/seller/my-listings", verifyToken, authorizeRoles("seller"), getMyListings);
router.get("/:id/images", getCarImages);
router.post("/:id/images", verifyToken, authorizeRoles("seller", "admin"), upload.single("image"), addCarImage);
router.delete("/images/:imageId", verifyToken, authorizeRoles("seller", "admin"), deleteCarImage);
router.get("/:id", getCarById);
router.post("/", verifyToken, authorizeRoles("seller"), upload.single("image"), addCar);
router.put("/:id", verifyToken, authorizeRoles("seller", "admin"), upload.single("image"), updateCar);
router.delete("/:id", verifyToken, authorizeRoles("seller", "admin"), deleteCar);
router.patch("/:id/status", verifyToken, authorizeRoles("admin"), updateCarStatus);

module.exports = router;
