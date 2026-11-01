const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const Prescription = require("../models/Prescription");

const dateRange = (from, to) => {
  const range = {};
  if (from || to) {
    if (from) range.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) range.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  return Object.keys(range).length ? range : null;
};

const adminReports = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }

    const { from, to, type = "overview", status, doctorId } = req.query;
    const createdAt = dateRange(from, to);
    const appointmentFilter = {};
    if (from || to) {
      // Appointment dates are stored as YYYY-MM-DD strings.
      appointmentFilter.date = {};
      if (from) appointmentFilter.date.$gte = from;
      if (to) appointmentFilter.date.$lte = to;
    }
    if (status && status !== "all") appointmentFilter.status = status;
    if (doctorId && doctorId !== "all") appointmentFilter.doctor = doctorId;

    const createdFilter = createdAt ? { createdAt } : {};
    // Income includes approved + completed appointments. Waiting and cancelled are excluded.
    // It respects date and doctor filters, but intentionally ignores the status dropdown.
    const incomeFilter = {};
    if (from || to) {
      incomeFilter.date = {};
      if (from) incomeFilter.date.$gte = from;
      if (to) incomeFilter.date.$lte = to;
    }
    if (doctorId && doctorId !== "all") incomeFilter.doctor = doctorId;
    incomeFilter.status = { $in: ["approved", "completed"] };

    const approvedFilter = { ...incomeFilter, status: "approved" };
    const [totalPatients, totalDoctors, totalAppointments, completed, cancelled, waiting,
      approvedAppointments, incomeAppointments, patients, doctors, appointments, records, prescriptions] = await Promise.all([
      Patient.countDocuments(), Doctor.countDocuments(), Appointment.countDocuments(),
      Appointment.countDocuments({ status: "completed" }),
      Appointment.countDocuments({ status: "cancelled" }),
      Appointment.countDocuments({ status: "waiting" }),
      Appointment.find(approvedFilter).populate("doctor", "fees").lean(),
      Appointment.find(incomeFilter).populate("doctor", "fees").lean(),
      type === "patients" || type === "overview" ? Patient.find(createdFilter).select("name email phone age gender createdAt").sort({ createdAt: -1 }).limit(500).lean() : Promise.resolve([]),
      type === "doctors" || type === "overview" ? Doctor.find(createdFilter).select("name email phone specialization qualification experience isActive createdAt").sort({ createdAt: -1 }).limit(500).lean() : Promise.resolve([]),
      ["appointments", "overview"].includes(type) ? Appointment.find(appointmentFilter).populate("doctor", "name specialization fees").sort({ date: -1, createdAt: -1 }).limit(1000).lean() : Promise.resolve([]),
      ["records", "overview"].includes(type) ? MedicalRecord.find(createdFilter).populate("patient", "name email").populate("doctor", "name specialization fees").sort({ createdAt: -1 }).limit(500).lean() : Promise.resolve([]),
      ["prescriptions", "overview"].includes(type) ? Prescription.find(createdFilter).populate("patient", "name email").populate("doctor", "name specialization fees").sort({ createdAt: -1 }).limit(500).lean() : Promise.resolve([]),
    ]);

    const approvedCount = approvedAppointments.length;
    const incomeAppointmentCount = incomeAppointments.length;
    const totalIncome = incomeAppointments.reduce((sum, appointment) => {
      const fee = Number(appointment.doctor?.fees || 0);
      return sum + (Number.isFinite(fee) && fee > 0 ? fee : 0);
    }, 0);

    return res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      filters: { from: from || null, to: to || null, type, status: status || "all", doctorId: doctorId || "all" },
      statistics: {
        totalPatients, totalDoctors, totalAppointments,
        completedAppointments: completed, cancelledAppointments: cancelled,
        pendingAppointments: waiting,
        approvedAppointments: approvedCount,
        incomeEligibleAppointments: incomeAppointmentCount,
        totalIncome
      },
      data: { patients, doctors, appointments, medicalRecords: records, prescriptions }
    });
  } catch (error) {
    console.error("Admin reports error:", error);
    return res.status(500).json({ success: false, message: "Unable to generate reports." });
  }
};

module.exports = { adminReports };
