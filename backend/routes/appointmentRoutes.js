const express = require("express");

const {
  createAppointment,
  getSlotAvailability,
  getAppointments,
  getMyUpcomingAppointment,
  getMyAppointments,
  cancelMyAppointment,
  blockAppointmentSlot,
  updateAppointmentStatus,
  markPatientAvailable,
  getPatientQueue,
  startConsultation,
  completeConsultation,
} = require("../controllers/appointmentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Patient routes
router.get("/availability", authMiddleware, getSlotAvailability);
router.post("/", authMiddleware, createAppointment);
router.get("/my-upcoming", authMiddleware, getMyUpcomingAppointment);
router.get("/my-appointments", authMiddleware, getMyAppointments);
router.patch("/:id/cancel", authMiddleware, cancelMyAppointment);

// Admin / doctor appointment management
router.get("/", authMiddleware, getAppointments);
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);
router.post("/block-slot", authMiddleware, blockAppointmentSlot);

// Patient check-in and queue
router.patch("/:id/check-in", authMiddleware, markPatientAvailable);
router.get("/queue", authMiddleware, getPatientQueue);

// Consultation lifecycle
router.patch("/:id/start-consultation", authMiddleware, startConsultation);
router.patch("/:id/complete-consultation", authMiddleware, completeConsultation);

module.exports = router;
