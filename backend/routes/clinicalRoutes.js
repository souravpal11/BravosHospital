const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMedicalRecords, createMedicalRecord, deleteMedicalRecord, uploadPatientReport, downloadMedicalRecordFile, listHospitalDoctors, shareMedicalRecord,
  getPrescriptions, createPrescription, deletePrescription,
} = require("../controllers/clinicalController");

const router = express.Router();
const reportDirectory = path.join(process.cwd(), "uploads", "private-reports");
fs.mkdirSync(reportDirectory, { recursive: true });

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, reportDirectory),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const validExtension = [".pdf", ".jpg", ".jpeg", ".png"].includes(extension);
    if (allowedTypes.has(file.mimetype) && validExtension) return callback(null, true);
    return callback(new Error("Only PDF, JPG and PNG files are allowed"));
  },
});
router.use(authMiddleware);

router.get("/doctors", listHospitalDoctors);
router.get("/records", getMedicalRecords);
router.post("/records/:id/share", shareMedicalRecord);
router.post("/records/upload", (req, res, next) => {
  upload.single("report")(req, res, error => {
    if (error) return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      success: false,
      message: error.code === "LIMIT_FILE_SIZE" ? "File size must be 10 MB or less" : error.message,
    });
    next();
  });
}, uploadPatientReport);
router.get("/records/:id/file", downloadMedicalRecordFile);
router.post("/records", createMedicalRecord);
router.delete("/records/:id", deleteMedicalRecord);

router.get("/prescriptions", getPrescriptions);
router.post("/prescriptions", createPrescription);
router.delete("/prescriptions/:id", deletePrescription);

module.exports = router;
