const express = require("express");

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
router.post("/register", registerDoctor);

// Doctor login
router.post("/login", loginDoctor);

router.post("/forgot-password", forgotDoctorPassword);

router.post("/reset-password", resetDoctorPassword);

module.exports = router;
