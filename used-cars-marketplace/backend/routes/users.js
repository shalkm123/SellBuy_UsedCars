// routes/users.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const { getAllUsers, getUserById, deleteUser, updateUserRole } = require("../controllers/userController");

router.get("/", verifyToken, authorizeRoles("admin"), getAllUsers);
router.get("/:id", verifyToken, authorizeRoles("admin"), getUserById);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteUser);
router.patch("/:id/role", verifyToken, authorizeRoles("admin"), updateUserRole);

module.exports = router;
