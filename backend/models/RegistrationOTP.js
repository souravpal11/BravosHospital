const mongoose = require("mongoose");

const registrationOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["patient", "doctor", "admin"],
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RegistrationOTP",
  registrationOTPSchema
);