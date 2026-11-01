const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");
const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const isAdmin = (req) => req.user?.role === "admin";
const isDoctor = (req) => req.user?.role === "doctor";
const isPatient = (req) => req.user?.role === "patient";

async function doctorCanAccessPatient(doctorId, patientId) {
  return Appointment.exists({ doctor: doctorId, patient: patientId });
}

async function canReadPatient(req, patientId) {
  if (isAdmin(req)) return true;
  if (isPatient(req)) return String(req.user.id) === String(patientId);
  if (isDoctor(req))
    return Boolean(await doctorCanAccessPatient(req.user.id, patientId));
  return false;
}

async function createClinicalItem(req, res, Model, kind) {
  try {
    if (!isDoctor(req))
      return res
        .status(403)
        .json({
          success: false,
          message: "Only doctors can create clinical records",
        });
    const { patient: patientId, appointment: appointmentId } = req.body;
    const payload =
      kind === "record"
        ? {
            title: String(req.body.title || "").trim(),
            recordType: req.body.recordType,
            diagnosis: String(req.body.diagnosis || "").trim(),
            notes: String(req.body.notes || "").trim(),
            fileUrl: String(req.body.fileUrl || "").trim(),
            recordedAt: req.body.recordedAt || undefined,
          }
        : {
            medications: Array.isArray(req.body.medications)
              ? req.body.medications.map((m) => ({
                  name: String(m.name || "").trim(),
                  dosage: String(m.dosage || "").trim(),
                  frequency: String(m.frequency || "").trim(),
                  duration: String(m.duration || "").trim(),
                  instructions: String(m.instructions || "").trim(),
                }))
              : [],
            diagnosis: String(req.body.diagnosis || "").trim(),
            notes: String(req.body.notes || "").trim(),
            prescribedAt: req.body.prescribedAt || undefined,
            validUntil: req.body.validUntil || null,
            status: ["active", "completed", "cancelled"].includes(
              req.body.status,
            )
              ? req.body.status
              : "active",
          };
    if (!validId(patientId))
      return res
        .status(400)
        .json({ success: false, message: "A valid patient ID is required" });
    const patient = await Patient.findById(patientId).select("_id");
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    if (!(await doctorCanAccessPatient(req.user.id, patientId)))
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only create records for patients assigned to you",
        });
    if (appointmentId) {
      if (!validId(appointmentId))
        return res
          .status(400)
          .json({ success: false, message: "Invalid appointment ID" });
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        patient: patientId,
        doctor: req.user.id,
      });
      if (!appointment)
        return res
          .status(403)
          .json({
            success: false,
            message: "Appointment does not belong to this patient and doctor",
          });
    }
    const item = await Model.create({
      ...payload,
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId || null,
    });
    const populated = await Model.findById(item._id)
      .populate("patient", "name email")
      .populate("doctor", "name specialization");
    return res.status(201).json({ success: true, [kind]: populated });
  } catch (error) {
    if (error.name === "ValidationError")
      return res.status(400).json({ success: false, message: error.message });
    console.error(`Create ${kind} error:`, error);
    return res
      .status(500)
      .json({ success: false, message: `Unable to create ${kind}` });
  }
}


async function listClinicalItems(req, res, Model, kind) {
  try {
    const filter = {};
    const supportsSharing = Boolean(
      Model.schema.path("sharedWithDoctors")
    );

    if (isPatient(req)) {
      filter.patient = req.user.id;
    } 
    else if (isDoctor(req)) {
      const patientId = req.query.patientId;

      if (patientId) {
        if (!validId(patientId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid patient ID"
          });
        }

        filter.patient = patientId;

        if (supportsSharing) {
          filter.$or = [
            { doctor: req.user.id },
            { sharedWithDoctors: req.user.id }
          ];
        } else {
          filter.doctor = req.user.id;
        }
      } else {
        if (supportsSharing) {
          filter.$or = [
            { doctor: req.user.id },
            { sharedWithDoctors: req.user.id }
          ];
        } else {
          filter.doctor = req.user.id;
        }
      }
    } 
    else if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (req.query.patientId && isAdmin(req)) {
      if (!validId(req.query.patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID"
        });
      }

      filter.patient = req.query.patientId;
    }

    if (req.query.doctorId && isAdmin(req)) {
      if (!validId(req.query.doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID"
        });
      }

      filter.doctor = req.query.doctorId;
    }

    let query = Model.find(filter)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    // Only MedicalRecord supports sharedWithDoctors
    if (supportsSharing) {
      query = query.populate(
        "sharedWithDoctors",
        "name specialization"
      );
    }

    const items = await query
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({
      success: true,
      count: items.length,
      [kind]: items
    });

  } catch (error) {
    console.error(`List ${kind} error:`, error);

    return res.status(500).json({
      success: false,
      message: `Unable to fetch ${kind}`
    });
  }
}
async function deleteClinicalItem(req, res, Model, kind) {
  try {
    if (!isAdmin(req) && !isDoctor(req))
      return res
        .status(403)
        .json({
          success: false,
          message: "Only admin or doctor can delete clinical records",
        });
    if (!validId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid record ID" });
    const item = await Model.findById(req.params.id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: `${kind} not found` });
    if (isDoctor(req) && String(item.doctor) !== String(req.user.id))
      return res
        .status(403)
        .json({
          success: false,
          message: "You can only delete records you created",
        });
    await item.deleteOne();
    return res.json({ success: true, message: `${kind} deleted successfully` });
  } catch (error) {
    console.error(`Delete ${kind} error:`, error);
    return res
      .status(500)
      .json({ success: false, message: `Unable to delete ${kind}` });
  }
}

async function uploadPatientReport(req, res) {
  try {
    if (!isPatient(req))
      return res
        .status(403)
        .json({
          success: false,
          message: "Only patients can upload their own reports",
        });
    if (!req.file)
      return res
        .status(400)
        .json({
          success: false,
          message: "Please select a PDF, JPG or PNG file",
        });

    const patientId = req.user.id || req.user._id;
    if (!validId(patientId)) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({
          success: false,
          message: "Your patient account ID is invalid. Please sign in again.",
        });
    }
    const patient = await Patient.findById(patientId).select("_id");
    if (!patient) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Your patient profile was not found. Please contact hospital administration.",
        });
    }

    const title = String(req.body.title || req.file.originalname)
      .trim()
      .slice(0, 160);
    const recordType = [
      "lab_report",
      "imaging",
      "discharge_summary",
      "other",
    ].includes(req.body.recordType)
      ? req.body.recordType
      : "other";
    const notes = String(req.body.notes || "")
      .trim()
      .slice(0, 3000);
    const prescribedBy = String(req.body.prescribedBy || "")
      .trim()
      .slice(0, 120);
    const latestAppointment = await Appointment.findOne({
      patient: patientId,
      status: { $ne: "cancelled" },
    })
      .sort({ date: -1, createdAt: -1 })
      .select("doctor");

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: latestAppointment?.doctor || null,
      title,
      recordType,
      prescribedBy,
      notes,
      fileUrl: "",
      filePath: req.file.path,
      fileName: path.basename(req.file.originalname).slice(0, 180),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedByRole: "patient",
      recordedAt: new Date(),
    });
    record.fileUrl = `/api/clinical/records/${record._id}/file`;
    await record.save();
    const populated = await MedicalRecord.findById(record._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");
    return res
      .status(201)
      .json({
        success: true,
        record: populated,
        message: "Report uploaded successfully",
      });
  } catch (error) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    console.error("Patient report upload error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to upload report" });
  }
}

async function listHospitalDoctors(req, res) {
  try {
    if (!isPatient(req))
      return res
        .status(403)
        .json({
          success: false,
          message: "Only patients can choose a doctor to share reports",
        });
    const doctors = await Doctor.find({})
      .select("_id name specialization department")
      .sort({ name: 1 })
      .lean();
    return res.json({ success: true, doctors });
  } catch (error) {
    console.error("List hospital doctors error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load hospital doctors" });
  }
}

async function shareMedicalRecord(req, res) {
  try {
    if (!isPatient(req))
      return res
        .status(403)
        .json({
          success: false,
          message: "Only the patient who uploaded the report can share it",
        });
    const { id } = req.params;
    const { doctorId } = req.body;
    if (!validId(id) || !validId(doctorId))
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid report and doctor IDs are required",
        });
    const record = await MedicalRecord.findOne({
      _id: id,
      patient: req.user.id,
    });
    if (!record)
      return res
        .status(404)
        .json({
          success: false,
          message: "Your uploaded report was not found",
        });
    const doctor = await Doctor.findById(doctorId).select("_id");
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    const alreadyShared = (record.sharedWithDoctors || []).some(
      (value) => String(value) === String(doctorId),
    );
    if (!alreadyShared) record.sharedWithDoctors.push(doctorId);
    await record.save();
    const populated = await MedicalRecord.findById(record._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .populate("sharedWithDoctors", "name specialization");
    return res.json({
      success: true,
      record: populated,
      message: "Report shared with the selected doctor",
    });
  } catch (error) {
    console.error("Share medical report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to share report" });
  }
}

async function downloadMedicalRecordFile(req, res) {
  try {
    if (!validId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid record ID" });
    const record = await MedicalRecord.findById(req.params.id).select(
      "+filePath patient fileName mimeType fileUrl",
    );
    if (!record || !record.filePath)
      return res
        .status(404)
        .json({ success: false, message: "Uploaded file not found" });
    const explicitlyShared =
      isDoctor(req) &&
      (record.sharedWithDoctors || []).some(
        (id) => String(id) === String(req.user.id),
      );
    const isOwnerPatient =
      isPatient(req) && String(record.patient) === String(req.user.id);
    const isAdminUser = isAdmin(req);
    // Uploaded patient files are private by default. Appointment assignment alone
    // does not grant a doctor access; the patient must share the report explicitly.
    const doctorAuthoredRecord =
      isDoctor(req) && String(record.doctor || "") === String(req.user.id);
    if (
      !(
        isOwnerPatient ||
        isAdminUser ||
        explicitlyShared ||
        doctorAuthoredRecord
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "You are not allowed to access this report. Ask the patient to share it with you.",
        });
    }
    const absolutePath = path.resolve(record.filePath);
    const privateRoot =
      path.resolve(process.cwd(), "uploads", "private-reports") + path.sep;
    if (!absolutePath.startsWith(privateRoot) || !fs.existsSync(absolutePath)) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Uploaded file is no longer available",
        });
    }
    res.setHeader(
      "Content-Type",
      record.mimeType || "application/octet-stream",
    );
    return res.download(
      absolutePath,
      record.fileName || "medical-report",
      (error) => {
        if (error && !res.headersSent)
          res
            .status(500)
            .json({ success: false, message: "Unable to download report" });
      },
    );
  } catch (error) {
    console.error("Download medical report error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to download report" });
  }
}

exports.uploadPatientReport = uploadPatientReport;
exports.listHospitalDoctors = listHospitalDoctors;
exports.shareMedicalRecord = shareMedicalRecord;
exports.downloadMedicalRecordFile = downloadMedicalRecordFile;
exports.getMedicalRecords = (req, res) =>
  listClinicalItems(req, res, MedicalRecord, "records");
exports.createMedicalRecord = (req, res) =>
  createClinicalItem(req, res, MedicalRecord, "record");
exports.deleteMedicalRecord = (req, res) =>
  deleteClinicalItem(req, res, MedicalRecord, "Medical record");
exports.getPrescriptions = (req, res) =>
  listClinicalItems(req, res, Prescription, "prescriptions");
exports.createPrescription = (req, res) =>
  createClinicalItem(req, res, Prescription, "prescription");
exports.deletePrescription = (req, res) =>
  deleteClinicalItem(req, res, Prescription, "Prescription");
