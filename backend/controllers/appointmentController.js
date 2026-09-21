const Appointment = require("../models/Appointment");
const Patient = require("../models/patient");

// ==========================================
// CREATE APPOINTMENT
// ==========================================

const createAppointment = async (req, res) => {
  try {
    // ==========================
    // AUTHENTICATION
    // ==========================

    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Please login as a patient to book an appointment",
      });
    }

    // ==========================
    // GET PATIENT
    // ==========================

    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const {
      department,
      doctor,
      date,
      time,
      message,
    } = req.body;

    // ==========================
    // BASIC VALIDATION
    // ==========================

    if (!department || !doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required appointment fields",
      });
    }

    // ==========================
    // CHECK DOCTOR
    // ==========================

    const Doctor = require("../models/Doctor");

    const doctorData = await Doctor.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctorData.isActive) {
      return res.status(400).json({
        success: false,
        message: "This doctor is currently unavailable",
      });
    }

    // ==========================
    // CHECK BLOCKED DAY / SLOT
    // ==========================

    const BlockedSlot = require("../models/BlockedSlot");

    const blocked = await BlockedSlot.findOne({
      doctor,
      date,
      $or: [
        { time: time },
        { time: null },
      ],
    });

    if (blocked) {
      return res.status(409).json({
        success: false,
        message:
          blocked.time
            ? `This appointment slot is unavailable. Reason: ${blocked.reason}`
            : `Doctor is unavailable on this date. Reason: ${blocked.reason}`,
      });
    }

    // ==========================
    // CHECK EXISTING APPOINTMENTS
    // ==========================

    const confirmedCount = await Appointment.countDocuments({
      doctor,
      date,
      time,
      status: "approved",
    });

    const waitingCount = await Appointment.countDocuments({
      doctor,
      date,
      time,
      status: "waiting",
    });

    // ==========================
    // DETERMINE STATUS
    // ==========================

    let appointmentStatus;

    if (confirmedCount < 6) {
      appointmentStatus = "approved";
    } else if (waitingCount < 1) {
      appointmentStatus = "waiting";
    } else {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is full. Please select another time.",
      });
    }

    // ==========================
    // CREATE APPOINTMENT
    // ==========================

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
    });

    // ==========================
    // RESPONSE
    // ==========================

    res.status(201).json({
      success: true,

      message:
        appointmentStatus === "approved"
          ? "Appointment confirmed successfully"
          : "You have been added to the waiting list",

      appointment,
    });

  } catch (error) {
    console.error("Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to book appointment",
      error: error.message,
    });
  }
};
// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch appointments",
    });
  }
};

// ==========================================
// GET MY UPCOMING APPOINTMENT
// ==========================================

// ==========================================
// GET MY UPCOMING APPOINTMENT
// ==========================================

const getMyUpcomingAppointment = async (req, res) => {
  try {
    // Only patients
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their appointments",
      });
    }

    const patientId = req.user.id;

    // Get patient's active appointments
    const appointments = await Appointment.find({
      patient: patientId,
      status: { $nin: ["completed", "rejected"] },
    })
      .populate("doctor", "name specialization qualification experience fees")
      .sort({ date: 1, time: 1 });
    const now = new Date();

    // Convert "10:00 AM" -> "10:00"
    // Convert "02:00 PM" -> "14:00"
    const convertTimeTo24Hour = (time) => {
      if (!time) return null;

      const [timePart, modifier] = time.trim().split(" ");

      let [hours, minutes] = timePart.split(":");

      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      }

      if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}`;
    };

    // Find nearest upcoming appointment
    const upcomingAppointment = appointments.find((appointment) => {
      const time24 = convertTimeTo24Hour(appointment.time);

      if (!time24) return false;

      const appointmentDateTime = new Date(`${appointment.date}T${time24}:00`);

      console.log("Appointment:", appointment.date, appointment.time);
      console.log("Converted:", appointmentDateTime);
      console.log("Current:", now);

      return appointmentDateTime > now;
    });

    if (!upcomingAppointment) {
      return res.status(200).json({
        success: true,
        appointment: null,
      });
    }

    res.status(200).json({
      success: true,
      appointment: upcomingAppointment,
    });
  } catch (error) {
    console.error("Upcoming Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch upcoming appointment",
      error: error.message,
    });
  }
};
// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to update appointment",
    });
  }
};

// ==========================================
// GET ALL MY APPOINTMENTS
// ==========================================

const getMyAppointments = async (req, res) => {
  try {
    // Only patients can access their appointments
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access their appointments",
      });
    }

    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patient: patientId,
    })
      .populate(
        "doctor",
        "name specialization qualification experience fees"
      )
      .sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("My Appointments Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch your appointments",
      error: error.message,
    });
  }
};

const cancelMyAppointment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can cancel their appointments",
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id,
      status: {
        $in: ["approved", "waiting"],
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or cannot be cancelled",
      });
    }

    const wasApproved = appointment.status === "approved";

    appointment.status = "cancelled";
    appointment.cancelledBy = "patient";
    appointment.cancellationReason =
      req.body.reason || "Cancelled by patient";
    appointment.cancelledAt = new Date();

    await appointment.save();

    let waitingPatient = null;

    // Only an approved appointment creates a free seat
    if (wasApproved) {
      waitingPatient = await Appointment.findOne({
        doctor: appointment.doctor,
        date: appointment.date,
        time: appointment.time,
        status: "waiting",
      }).sort({ createdAt: 1 });

      if (waitingPatient) {
        waitingPatient.status = "approved";
        await waitingPatient.save();
      }
    }

    res.status(200).json({
      success: true,
      message: waitingPatient
        ? "Appointment cancelled. Waiting patient has been confirmed."
        : "Appointment cancelled successfully.",
      promotedAppointment: waitingPatient,
    });

  } catch (error) {
    console.error("Cancel Appointment Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel appointment",
      error: error.message,
    });
  }
};

const blockAppointmentSlot = async (req, res) => {
  try {
    if (
      !req.user ||
      !["doctor", "admin"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only doctors and admins can block appointment slots",
      });
    }

    const {
      doctor,
      date,
      time,
      reason,
    } = req.body;

    if (!doctor || !date || !reason) {
      return res.status(400).json({
        success: false,
        message: "Doctor, date and reason are required",
      });
    }

    const BlockedSlot = require("../models/BlockedSlot");

    // Prevent duplicate block
    const existingBlock = await BlockedSlot.findOne({
      doctor,
      date,
      time: time || null,
    });

    if (existingBlock) {
      return res.status(409).json({
        success: false,
        message: "This slot is already blocked",
      });
    }

    const blockedSlot = await BlockedSlot.create({
      doctor,
      date,
      time: time || null,
      reason,
      blockedBy: req.user.role,
      blockedByUser: req.user.id,
    });

    // Cancel affected appointments
    const query = {
      doctor,
      date,
      status: {
        $in: ["approved", "waiting"],
      },
    };

    if (time) {
      query.time = time;
    }

    await Appointment.updateMany(
      query,
      {
        $set: {
          status: "cancelled",
          cancelledBy: req.user.role,
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
      }
    );

    res.status(201).json({
      success: true,
      message: time
        ? "Appointment slot blocked successfully"
        : "Doctor's entire date blocked successfully",
      blockedSlot,
    });

  } catch (error) {
    console.error("Block Slot Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to block appointment slot",
      error: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getMyUpcomingAppointment,
  getMyAppointments,
  cancelMyAppointment,
  blockAppointmentSlot,
  updateAppointmentStatus,
};
