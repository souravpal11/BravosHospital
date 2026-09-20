const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    qualification: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
    },

    fees: {
      type: Number,
      required: true,
      min: 0,
    },

    gender: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Doctor", doctorSchema);
