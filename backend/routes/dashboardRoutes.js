const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  adminDashboard,
  doctorDashboard,
  patientDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/admin", authMiddleware, adminDashboard);
router.get("/doctor", authMiddleware, doctorDashboard);
router.get("/patient", authMiddleware, patientDashboard);

module.exports = router;
