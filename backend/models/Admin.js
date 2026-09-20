const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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

    role: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  },
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
