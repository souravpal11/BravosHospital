const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const BlockedSlot = require("../models/BlockedSlot");

// Appointment date and time are stored as local Indian date/time strings.
// Convert IST (UTC+05:30) to a UTC Date for comparisons.
const getAppointmentDateTime = (date, time) => {
  if (!date || !time || typeof date !== "string" || typeof time !== "string") {
    return null;
  }

  const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.trim().toUpperCase().match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/
  );

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const modifier = timeMatch[3];

  if (month < 1 || month > 12 || day < 1 || day > 31 || minutes < 0 || minutes > 59) {
    return null;
  }

  if (modifier) {
    if (hours < 1 || hours > 12) return null;
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes) - 330 * 60 * 1000
  );
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const timeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59) return null;
  if (match[3]) {
    if (hours < 1 || hours > 12) return null;
    if (match[3] === "PM" && hours !== 12) hours += 12;
    if (match[3] === "AM" && hours === 12) hours = 0;
  } else if (hours > 23) return null;
  return hours * 60 + minutes;
};

const getBlockedSlot = async (doctor, date, time) => {
  const appointmentMinutes = timeToMinutes(time);
  const blocks = await BlockedSlot.find({ doctor, date });
  return blocks.find((block) => {
    // Whole-day block (legacy representation).
    if (!block.time && !block.startTime && !block.endTime) return true;
    // Legacy exact-time block.
    if (block.time && block.time.trim().toUpperCase() === time.trim().toUpperCase()) return true;
    // Range block: start inclusive, end exclusive.
    if (block.startTime && block.endTime && appointmentMinutes !== null) {
      const start = timeToMinutes(block.startTime);
      const end = timeToMinutes(block.endTime);
      return start !== null && end !== null && appointmentMinutes >= start && appointmentMinutes < end;
    }
    return false;
  }) || null;
};

// Returns: available, waiting, or not_available.
const checkSlotAvailability = async (doctor, date, time) => {
  if (!isValidObjectId(doctor)) {
    return {
      availability: "not_available",
      message: "Please select a valid doctor.",
    };
  }

  const appointmentDateTime = getAppointmentDateTime(date, time);
  if (!appointmentDateTime || appointmentDateTime <= new Date()) {
    return {
      availability: "not_available",
      message: "Please select a valid future appointment date and time.",
    };
  }

  const doctorData = await Doctor.findById(doctor);
  if (!doctorData || !doctorData.isActive) {
    return {
      availability: "not_available",
      message: "This doctor is currently unavailable.",
    };
  }

  const blockedSlot = await getBlockedSlot(doctor, date, time);
  if (blockedSlot) {
    return {
      availability: "not_available",
      message: blockedSlot.reason
        ? `This slot is unavailable. Reason: ${blockedSlot.reason}`
        : "This doctor or appointment slot is blocked.",
    };
  }

  const [confirmedCount, waitingCount] = await Promise.all([
    Appointment.countDocuments({
      doctor,
      date,
      time,
      status: "approved",
    }),
    Appointment.countDocuments({
      doctor,
      date,
      time,
      status: "waiting",
    }),
  ]);

  if (confirmedCount < 6) {
    return {
      availability: "available",
      message: "Appointment slot is available.",
      confirmedCount,
      waitingCount,
    };
  }

  if (waitingCount < 1) {
    return {
      availability: "waiting",
      message: "Confirmed capacity is full. You can join the waiting list.",
      confirmedCount,
      waitingCount,
    };
  }

  return {
    availability: "not_available",
    message: "This appointment slot is completely full. Please select another time.",
    confirmedCount,
    waitingCount,
  };
};

// Promote the earliest waiting appointment for a released confirmed slot.
const promoteWaitingAppointment = async (doctor, date, time) => {
  const waitingAppointment = await Appointment.findOne({
    doctor,
    date,
    time,
    status: "waiting",
  }).sort({ createdAt: 1, _id: 1 });

  if (!waitingAppointment) return null;

  waitingAppointment.status = "approved";
  await waitingAppointment.save();
  return waitingAppointment;
};

// ==========================================
// CHECK SLOT AVAILABILITY (PATIENT FORM)
// ==========================================
const getSlotAvailability = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can check appointment availability.",
      });
    }

    const { doctor, date, time } = req.query;
    if (!doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and time are required.",
      });
    }

    const result = await checkSlotAvailability(doctor, date, time);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Slot availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to check slot availability.",
    });
  }
};

// ==========================================
// CREATE APPOINTMENT
// ==========================================
const createAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Please login as a patient to book an appointment.",
      });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const { department, doctor, date, time, message } = req.body;
    if (!department || !doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required appointment fields.",
      });
    }

    if (!isValidObjectId(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor selected.",
      });
    }

    // Re-check on the server at the exact time of booking.
    const slot = await checkSlotAvailability(doctor, date, time);

    if (slot.availability === "not_available") {
      return res.status(409).json({
        success: false,
        availability: "not_available",
        message: slot.message,
      });
    }

    const appointmentStatus =
      slot.availability === "available" ? "approved" : "waiting";

    const appointment = await Appointment.create({
      patient: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      department,
      doctor,
      date,
      time,
      message: message || "",
      status: appointmentStatus,
      attendanceStatus: "not_arrived",
    });

    return res.status(201).json({
      success: true,
      availability: slot.availability,
      message:
        appointmentStatus === "approved"
          ? "Appointment confirmed successfully."
          : "Confirmed capacity is full. You have been added to the waiting list.",
      appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to book appointment.",
      error: error.message,
    });
  }
};

// ==========================================
// GET APPOINTMENTS (ADMIN / ASSIGNED DOCTOR)
// ==========================================
const getAppointments = async (req, res) => {
  try {
    if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or doctor can view all appointments.",
      });
    }

    const filter = {};
    if (req.user.role === "doctor") filter.doctor = req.user.id;

    const appointments = await Appointment.find(filter)
      .populate("doctor", "name specialization")
      .lean();
    appointments.sort((a, b) => {
      const aDate = getAppointmentDateTime(a.date, a.time)?.getTime() ?? 0;
      const bDate = getAppointmentDateTime(b.date, b.time)?.getTime() ?? 0;
      return bDate - aDate || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch appointments.",
    });
  }
};

// ==========================================
// GET PATIENT'S UPCOMING APPOINTMENT
// ==========================================
const getMyUpcomingAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their appointments.",
      });
    }

    const appointments = await Appointment.find({
      patient: req.user.id,
      status: { $in: ["approved", "waiting"] },
    })
      .populate("doctor", "name specialization qualification experience fees")
      .sort({ date: 1, time: 1 });

    const now = new Date();
    const upcomingAppointment =
      appointments.find((appointment) => {
        const scheduled = getAppointmentDateTime(
          appointment.date,
          appointment.time
        );
        return scheduled && scheduled > now;
      }) || null;

    return res.status(200).json({
      success: true,
      appointment: upcomingAppointment,
    });
  } catch (error) {
    console.error("Upcoming appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch upcoming appointment.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE BOOKING STATUS (ADMIN ONLY)
// Consultation completion has its own endpoint.
// ==========================================
const updateAppointmentStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can change appointment booking status.",
      });
    }

    const { status, reason } = req.body;
    const allowedStatuses = ["approved", "waiting", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status. Use approved, waiting or cancelled.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (["in_consultation", "completed"].includes(appointment.attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot change the booking status of an active or completed consultation.",
      });
    }

    const previousStatus = appointment.status;
    appointment.status = status;

    if (status === "cancelled") {
      appointment.cancelledBy = "admin";
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = reason || "Cancelled by hospital staff";
    } else {
      appointment.cancelledBy = null;
      appointment.cancelledAt = null;
      appointment.cancellationReason = "";
    }

    await appointment.save();

    let promotedAppointment = null;
    if (previousStatus === "approved" && status === "cancelled") {
      promotedAppointment = await promoteWaitingAppointment(
        appointment.doctor,
        appointment.date,
        appointment.time
      );
    }

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment,
      promotedAppointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update appointment status.",
    });
  }
};

// ==========================================
// GET ALL APPOINTMENTS FOR LOGGED-IN PATIENT
// ==========================================
const getMyAppointments = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their appointments.",
      });
    }

    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name specialization qualification experience fees")
      .lean();
    appointments.sort((a, b) => {
      const aDate = getAppointmentDateTime(a.date, a.time)?.getTime() ?? 0;
      const bDate = getAppointmentDateTime(b.date, b.time)?.getTime() ?? 0;
      return bDate - aDate || new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("My appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch your appointments.",
      error: error.message,
    });
  }
};

// ==========================================
// PATIENT CANCELS OWN APPOINTMENT
// Allowed only when >= 2 hours remain.
// ==========================================
const cancelMyAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can cancel their appointments.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id,
      status: { $in: ["approved", "waiting"] },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or it cannot be cancelled.",
      });
    }

    if (["in_consultation", "completed"].includes(appointment.attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: "This appointment can no longer be cancelled.",
      });
    }

    const scheduledDateTime = getAppointmentDateTime(
      appointment.date,
      appointment.time
    );

    if (!scheduledDateTime) {
      return res.status(400).json({
        success: false,
        message: "The appointment has an invalid date or time.",
      });
    }

    const remainingMilliseconds = scheduledDateTime.getTime() - Date.now();
    const twoHoursMilliseconds = 2 * 60 * 60 * 1000;

    // Exactly 2 hours remaining is allowed. Less than 2 hours is rejected.
    if (remainingMilliseconds < twoHoursMilliseconds) {
      return res.status(400).json({
        success: false,
        message: "Cancellation is allowed only up to 2 hours before the scheduled appointment.",
      });
    }

    const wasApproved = appointment.status === "approved";

    appointment.status = "cancelled";
    appointment.cancelledBy = "patient";
    appointment.cancellationReason =
      req.body?.reason || "Cancelled by patient";
    appointment.cancelledAt = new Date();

    await appointment.save();

    let promotedAppointment = null;
    if (wasApproved) {
      promotedAppointment = await promoteWaitingAppointment(
        appointment.doctor,
        appointment.date,
        appointment.time
      );
    }

    return res.status(200).json({
      success: true,
      message: promotedAppointment
        ? "Appointment cancelled. The earliest waiting patient has been promoted."
        : "Appointment cancelled successfully.",
      appointment,
      promotedAppointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to cancel appointment.",
      error: error.message,
    });
  }
};

// ==========================================
// BLOCK APPOINTMENT SLOT / DOCTOR DATE
// ==========================================
const blockAppointmentSlot = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can block doctor time slots." });
    }

    const { doctor, date, startTime, endTime, reason } = req.body;
    if (!doctor || !date || !startTime || !endTime || !reason?.trim()) {
      return res.status(400).json({ success: false, message: "Doctor, date, start time, end time and reason are required." });
    }
    if (!isValidObjectId(doctor)) {
      return res.status(400).json({ success: false, message: "Invalid doctor selected." });
    }
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) return res.status(404).json({ success: false, message: "Doctor not found." });

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    if (start === null || end === null || end <= start) {
      return res.status(400).json({ success: false, message: "Enter a valid time range. End time must be later than start time." });
    }

    const existingBlocks = await BlockedSlot.find({ doctor, date });
    const overlaps = existingBlocks.some((block) => {
      if (!block.time && !block.startTime && !block.endTime) return true;
      if (block.time && timeToMinutes(block.time) === start) return true;
      if (block.startTime && block.endTime) {
        const oldStart = timeToMinutes(block.startTime);
        const oldEnd = timeToMinutes(block.endTime);
        return oldStart !== null && oldEnd !== null && start < oldEnd && end > oldStart;
      }
      return false;
    });
    if (overlaps) return res.status(409).json({ success: false, message: "This time range overlaps an existing blocked period." });

    const blockedSlot = await BlockedSlot.create({
      doctor, date, startTime, endTime, time: null, reason: reason.trim(),
      blockedBy: "admin", blockedByUser: req.user.id,
    });

    // Cancel every not-yet-started appointment whose booked start time falls
    // inside [startTime, endTime). Completed/in-consultation appointments stay intact.
    const appointments = await Appointment.find({
      doctor, date,
      status: { $in: ["approved", "waiting"] },
      attendanceStatus: { $nin: ["in_consultation", "completed"] },
    });
    let cancelledAppointments = 0;
    for (const appointment of appointments) {
      const bookedMinutes = timeToMinutes(appointment.time);
      if (bookedMinutes === null || bookedMinutes < start || bookedMinutes >= end) continue;
      appointment.status = "cancelled";
      appointment.cancelledBy = "admin";
      appointment.cancellationReason = `Doctor time blocked: ${reason.trim()}`;
      appointment.cancelledAt = new Date();
      await appointment.save();
      cancelledAppointments += 1;
    }

    return res.status(201).json({
      success: true,
      message: `Time blocked successfully. ${cancelledAppointments} existing appointment(s) cancelled.`,
      blockedSlot,
      cancelledAppointments,
    });
  } catch (error) {
    console.error("Block slot error:", error);
    return res.status(500).json({ success: false, message: "Unable to block doctor time.", error: error.message });
  }
};

const getBlockedAppointmentSlots = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can view blocked slots." });
    }
    const filter = {};
    if (req.query.doctor) filter.doctor = req.query.doctor;
    if (req.query.date) filter.date = req.query.date;
    const slots = await BlockedSlot.find(filter).populate("doctor", "name specialization").sort({ date: 1, startTime: 1, time: 1 });
    return res.status(200).json({ success: true, blockedSlots: slots });
  } catch (error) {
    console.error("Get blocked slots error:", error);
    return res.status(500).json({ success: false, message: "Unable to load blocked slots." });
  }
};

const removeBlockedAppointmentSlot = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can remove blocked slots." });
    }
    const removed = await BlockedSlot.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: "Blocked slot not found." });
    return res.status(200).json({ success: true, message: "Blocked time removed. Patients can book this time again." });
  } catch (error) {
    console.error("Remove blocked slot error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove blocked time." });
  }
};

// ==========================================
// ADMIN CHECKS PATIENT IN
// ==========================================
const markPatientAvailable = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can check in patients.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved appointments can be checked in.",
      });
    }

    if (["completed", "no_show", "in_consultation"].includes(appointment.attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be checked in again.",
      });
    }

    if (!appointment.checkedInAt) appointment.checkedInAt = new Date();
    appointment.attendanceStatus = "available";
    appointment.attendanceUpdatedBy = "admin";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Patient checked in successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Patient check-in error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to check in patient.",
      error: error.message,
    });
  }
};

// ==========================================
// DOCTOR STARTS CONSULTATION
// ==========================================
const startConsultation = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can start consultations.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (String(appointment.doctor) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only consult your assigned patients.",
      });
    }

    if (appointment.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved appointments can be started.",
      });
    }

    if (appointment.attendanceStatus !== "available" || !appointment.checkedInAt) {
      return res.status(400).json({
        success: false,
        message: "Admin must check in the patient before consultation.",
      });
    }

    appointment.attendanceStatus = "in_consultation";
    appointment.consultationStartedAt = new Date();
    appointment.attendanceUpdatedBy = "doctor";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Consultation started successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Start consultation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start consultation.",
      error: error.message,
    });
  }
};

// ==========================================
// DOCTOR COMPLETES CONSULTATION
// ==========================================
const completeConsultation = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can complete consultations.",
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (String(appointment.doctor) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your assigned patients.",
      });
    }

    if (appointment.attendanceStatus !== "in_consultation") {
      return res.status(400).json({
        success: false,
        message: "Consultation must be started before it can be completed.",
      });
    }

    appointment.attendanceStatus = "completed";
    appointment.status = "completed";
    appointment.consultationCompletedAt = new Date();
    appointment.attendanceUpdatedBy = "doctor";

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Consultation completed successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Complete consultation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to complete consultation.",
      error: error.message,
    });
  }
};

// ==========================================
// GET PATIENT ARRIVAL QUEUE
// ==========================================
const getPatientQueue = async (req, res) => {
  try {
    if (!req.user || !["admin", "doctor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or doctor can view the patient queue.",
      });
    }

    const { doctor, date, time } = req.query;
    if (!doctor || !date) {
      return res.status(400).json({
        success: false,
        message: "Doctor and date are required.",
      });
    }

    if (!isValidObjectId(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor selected.",
      });
    }

    if (req.user.role === "doctor" && String(req.user.id) !== String(doctor)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own patient queue.",
      });
    }

    const filter = {
      doctor,
      date,
      status: "approved",
      attendanceStatus: { $in: ["available", "in_consultation"] },
      checkedInAt: { $ne: null },
    };
    if (time) filter.time = time;

    const appointments = await Appointment.find(filter)
      .select("name phone department doctor date time status attendanceStatus checkedInAt consultationStartedAt")
      .sort({ checkedInAt: 1, _id: 1 });

    const queue = appointments.map((appointment, index) => ({
      ...appointment.toObject(),
      priority: index + 1,
    }));

    return res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    console.error("Patient queue error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load patient queue.",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getSlotAvailability,
  getAppointments,
  getMyUpcomingAppointment,
  getMyAppointments,
  cancelMyAppointment,
  blockAppointmentSlot,
  getBlockedAppointmentSlots,
  removeBlockedAppointmentSlot,
  updateAppointmentStatus,
  markPatientAvailable,
  getPatientQueue,
  startConsultation,
  completeConsultation,
};
