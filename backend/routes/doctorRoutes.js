const express = require("express");
const doctorPhotoUpload = require("../middleware/doctorPhotoUpload");

const {
  registerDoctor,
  loginDoctor,
  getDoctors,
  forgotDoctorPassword,
  resetDoctorPassword,
} = require("../controllers/doctorController");

const router = express.Router();

// Get all active doctors
router.get("/", getDoctors);

// Register doctor
router.post("/register", doctorPhotoUpload.single("image"), registerDoctor);

// Doctor login
router.post("/login", loginDoctor);

router.post("/forgot-password", forgotDoctorPassword);

router.post("/reset-password", resetDoctorPassword);

module.exports = router;
