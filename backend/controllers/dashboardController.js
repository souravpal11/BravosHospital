const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getTodayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getMonthPrefix = () => getTodayInIndia().slice(0, 7);

const parseAppointmentDateTime = (date, time) => {
  if (!date || !time) return null;
  const match = String(time).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const result = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+05:30`);
  return Number.isNaN(result.getTime()) ? null : result;
};

const adminDashboard = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required." });
    }

    const monthPrefix = getMonthPrefix();
    const [totalDoctors, totalPatients, totalAppointments, pendingAppointments, monthAppointments, recentAppointments] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: "waiting" }),
        Appointment.countDocuments({ date: { $regex: `^${monthPrefix}` } }),
        Appointment.find()
          .populate("doctor", "name specialization")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    return res.json({
      success: true,
      statistics: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        monthAppointments,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load admin dashboard." });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    if (req.user?.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Doctor access required." });
    }

    const doctorId = req.user.id;
    const today = getTodayInIndia();
    const monthPrefix = getMonthPrefix();

    const [todayAppointments, allAppointments, pendingCount, completedThisMonth] = await Promise.all([
      Appointment.find({ doctor: doctorId, date: today, status: { $nin: ["cancelled"] } })
        .sort({ time: 1 })
        .lean(),
      Appointment.find({ doctor: doctorId })
        .sort({ date: -1, createdAt: -1 })
        .populate("doctor", "name specialization")
        .lean(),
      Appointment.countDocuments({ doctor: doctorId, status: "waiting" }),
      Appointment.countDocuments({
        doctor: doctorId,
        status: "completed",
        date: { $regex: `^${monthPrefix}` },
      }),
    ]);

    const patientIds = [...new Set(allAppointments.map(a => String(a.patient)).filter(Boolean))];
    const patients = patientIds.length
      ? await Patient.find({ _id: { $in: patientIds } })
          .select("name age gender phone email")
          .lean()
      : [];

    const patientMap = new Map(patients.map(p => [String(p._id), p]));
    const latestAppointmentByPatient = new Map();
    allAppointments.forEach(appointment => {
      const id = String(appointment.patient);
      if (!latestAppointmentByPatient.has(id)) {
        latestAppointmentByPatient.set(id, appointment);
      }
    });

    const recentPatients = patientIds
      .map(id => {
        const patient = patientMap.get(id);
        const latestAppointment = latestAppointmentByPatient.get(id);
        return patient
          ? { ...patient, lastVisit: latestAppointment?.date || null }
          : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    return res.json({
      success: true,
      statistics: {
        todayAppointments: todayAppointments.length,
        totalPatients: patientIds.length,
        pendingRequests: pendingCount,
        completedThisMonth,
      },
      todayAppointments,
      recentPatients,
      recentAppointments: allAppointments.slice(0, 5),
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load doctor dashboard." });
  }
};

const patientDashboard = async (req, res) => {
  try {
    if (req.user?.role !== "patient") {
      return res.status(403).json({ success: false, message: "Patient access required." });
    }

    const patientId = req.user.id;
    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const now = new Date();
    const upcomingAppointments = appointments.filter(appointment => {
      if (!["approved", "waiting"].includes(appointment.status)) return false;
      const scheduled = parseAppointmentDateTime(appointment.date, appointment.time);
      return scheduled && scheduled > now;
    });

    const uniqueDoctorIds = new Set(
      appointments.map(a => a.doctor?._id ? String(a.doctor._id) : String(a.doctor)).filter(Boolean)
    );
    const recentActivity = appointments.slice(0, 3).map(appointment => ({
      type: "appointment",
      title: appointment.status === "completed" ? "Consultation completed" :
        appointment.status === "cancelled" ? "Appointment cancelled" :
        appointment.status === "approved" ? "Appointment confirmed" : "Appointment requested",
      description: `${appointment.department || "Consultation"}${appointment.doctor?.name ? ` with ${appointment.doctor.name}` : ""}`,
      date: appointment.updatedAt || appointment.createdAt,
      status: appointment.status,
    }));

    return res.json({
      success: true,
      statistics: {
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        totalDoctors: uniqueDoctorIds.size,
      },
      upcomingAppointment: upcomingAppointments
        .slice()
        .sort((a, b) => {
          const da = parseAppointmentDateTime(a.date, a.time);
          const db = parseAppointmentDateTime(b.date, b.time);
          return da - db;
        })[0] || null,
      recentActivity,
      // This backend currently has no MedicalRecord or Prescription model/routes.
      medicalRecordsAvailable: false,
      prescriptionsAvailable: false,
    });
  } catch (error) {
    console.error("Patient dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load patient dashboard." });
  }
};

module.exports = { adminDashboard, doctorDashboard, patientDashboard };
