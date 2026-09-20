const express = require("express");

const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();


// Patient books appointment
router.post(
  "/",
  createAppointment
);


// Admin gets appointments
router.get(
  "/",
  getAppointments
);


// Admin updates status
router.patch(
  "/:id/status",
  updateAppointmentStatus
);


module.exports = router;
