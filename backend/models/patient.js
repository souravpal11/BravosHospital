const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
      enum: ["Male", "Female", "Other"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    resetOTP: {
      type: String,
      select: false,
    },

    resetOTPExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

const Patient =
  mongoose.models.Patient ||
  mongoose.model("Patient", patientSchema);

module.exports = Patient;
