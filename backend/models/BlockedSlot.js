const mongoose = require("mongoose");

const blockedSlotSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // YYYY-MM-DD
    date: {
      type: String,
      required: true,
    },

    // Example: "10:00 AM"
    // null means the entire day is blocked
    time: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    blockedBy: {
      type: String,
      enum: ["doctor", "admin"],
      required: true,
    },

    blockedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.BlockedSlot ||
  mongoose.model("BlockedSlot", blockedSlotSchema);