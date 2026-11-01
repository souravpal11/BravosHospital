const express = require("express");

const {
  registerDoctor,
  loginDoctor,
  getDoctors,
  forgotDoctorPassword,
  resetDoctorPassword,
  getAllDoctorsForAdmin,
  adminUpdateDoctor,
  updateDoctorOwnProfile,
} = require("../controllers/doctorController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Admin-only doctor management
router.get("/admin/all", authMiddleware, getAllDoctorsForAdmin);
router.patch("/admin/:id", authMiddleware, adminUpdateDoctor);

// Doctor can update permitted profile fields only
router.patch("/me/profile", authMiddleware, updateDoctorOwnProfile);

// Public doctor directory
router.get("/", getDoctors);

// Doctor registration
router.post("/register", registerDoctor);

// Doctor login
router.post("/login", loginDoctor);

// Password reset
router.post("/forgot-password", forgotDoctorPassword);
router.post("/reset-password", resetDoctorPassword);

module.exports = router;