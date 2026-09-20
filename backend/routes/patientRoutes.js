const express = require("express");
const router = express.Router();

const {
  registerPatient,
  loginPatient,
  forgotPatientPassword,
  resetPatientPassword,
  sendPatientRegistrationOTP,
  verifyPatientRegistrationOTP,
} = require("../controllers/patientController");

router.post("/register", registerPatient);
router.post("/login", loginPatient);

router.post("/forgot-password", forgotPatientPassword);
router.post("/reset-password", resetPatientPassword);

router.post(
  "/send-registration-otp",
  sendPatientRegistrationOTP
);

router.post(
  "/verify-registration-otp",
  verifyPatientRegistrationOTP
);

module.exports = router;