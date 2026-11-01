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

    // Legacy single-time block. null means no legacy exact-time value.
    time: { type: String, default: null },

    // New range block: startTime inclusive, endTime exclusive.
    // Both null means the entire date is blocked.
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },

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