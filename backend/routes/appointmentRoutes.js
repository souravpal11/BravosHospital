const express = require("express");

const {
  createAppointment,
  getAppointments,
  getMyUpcomingAppointment,
  getMyAppointments,
  cancelMyAppointment,
  blockAppointmentSlot,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// PATIENT BOOKS APPOINTMENT
// ==========================================

router.post(
  "/",
  authMiddleware,
  createAppointment
);


// ==========================================
// PATIENT UPCOMING APPOINTMENT
// ==========================================

router.get(
  "/my-upcoming",
  authMiddleware,
  getMyUpcomingAppointment
);


// ==========================================
// ADMIN GETS ALL APPOINTMENTS
// ==========================================

router.get(
  "/",
  getAppointments
);


// ==========================================
// ADMIN UPDATES STATUS
// ==========================================

router.patch(
  "/:id/status",
  updateAppointmentStatus
);

router.get(
  "/my-appointments",
  authMiddleware,
  getMyAppointments
);

// Patient cancels own appointment
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelMyAppointment
);

// Doctor/Admin blocks slot or day
router.post(
  "/block-slot",
  authMiddleware,
  blockAppointmentSlot
);

module.exports = router;