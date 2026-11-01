const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, trim: true, default: "" },
  frequency: { type: String, trim: true, default: "" },
  duration: { type: String, trim: true, default: "" },
  instructions: { type: String, trim: true, default: "" },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  medications: { type: [medicationSchema], validate: v => v.length > 0 },
  diagnosis: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" },
  prescribedAt: { type: Date, default: Date.now },
  validUntil: { type: Date, default: null },
  status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
}, { timestamps: true });

module.exports = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
