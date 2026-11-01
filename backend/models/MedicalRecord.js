const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null, index: true },
  sharedWithDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor", index: true }],
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  prescribedBy: { type: String, trim: true, maxlength: 120, default: "" },
  recordType: { type: String, enum: ["consultation", "lab_report", "imaging", "discharge_summary", "other"], default: "consultation" },
  diagnosis: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" },
  fileUrl: { type: String, trim: true, default: "" },
  // Private uploaded files are served only through the authenticated clinical route.
  filePath: { type: String, default: "", select: false },
  fileName: { type: String, trim: true, default: "" },
  mimeType: { type: String, trim: true, default: "" },
  fileSize: { type: Number, default: 0 },
  uploadedByRole: { type: String, enum: ["patient", "doctor", "admin", ""], default: "" },
  recordedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", medicalRecordSchema);
