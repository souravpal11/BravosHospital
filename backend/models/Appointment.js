const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // ==========================
    // PATIENT REFERENCE
    // ==========================

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // ==========================
    // PATIENT DETAILS
    // ==========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    // ==========================
    // APPOINTMENT DETAILS
    // ==========================

    department: {
      type: String,
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    // ==========================
    // APPOINTMENT STATUS
    // ==========================

    status: {
      type: String,
      enum: [
        "approved",
        "waiting",
        "cancelled",
        "completed",
      ],
      default: "approved",
    },

    // ==========================
    // CANCELLATION DETAILS
    // ==========================

    cancelledBy: {
      type: String,
      enum: ["patient", "doctor", "admin", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);