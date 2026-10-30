const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // Stored as YYYY-MM-DD and e.g. "10:00 AM".
    date: { type: String, required: true },
    time: { type: String, required: true },
    message: { type: String, default: "" },

    // Booking lifecycle
    status: {
      type: String,
      enum: ["approved", "waiting", "cancelled", "completed"],
      default: "approved",
    },

    // Physical arrival / consultation lifecycle
    attendanceStatus: {
      type: String,
      enum: [
        "not_arrived",
        "available",
        "in_consultation",
        "completed",
        "no_show",
      ],
      default: "not_arrived",
    },
    checkedInAt: { type: Date, default: null },
    consultationStartedAt: { type: Date, default: null },
    consultationCompletedAt: { type: Date, default: null },
    attendanceUpdatedBy: {
      type: String,
      enum: ["admin", "doctor", null],
      default: null,
    },

    // Cancellation audit fields
    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "admin", null],
      default: null,
    },
    cancellationReason: { type: String, default: "", trim: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
