const Appointment = require("../models/Appointment");


// ==========================================
// CREATE APPOINTMENT
// ==========================================

const createAppointment = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      age,
      gender,
      department,
      doctor,
      date,
      time,
      message,
    } = req.body;


    if (
      !name ||
      !email ||
      !phone ||
      !age ||
      !gender ||
      !department ||
      !doctor ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }


    const appointment =
      await Appointment.create({
        name,
        email,
        phone,
        age,
        gender,
        department,
        doctor,
        date,
        time,
        message,
      });


    res.status(201).json({
      success: true,
      message:
        "Appointment request submitted successfully",
      appointment,
    });


  } catch (error) {

    console.error(
      "Appointment Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to book appointment",
    });
  }
};


// ==========================================
// GET ALL APPOINTMENTS
// ==========================================

const getAppointments = async (req, res) => {
  try {

    const appointments =
      await Appointment.find()
        .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      appointments,
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Unable to fetch appointments",
    });
  }
};


// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

const updateAppointmentStatus = async (
  req,
  res
) => {

  try {

    const {
      status,
    } = req.body;


    const appointment =
      await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      );


    if (!appointment) {

      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });

    }


    res.status(200).json({
      success: true,
      message:
        "Appointment status updated",
      appointment,
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Unable to update appointment",
    });
  }
};


module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};