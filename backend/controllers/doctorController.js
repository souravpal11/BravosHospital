const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// ==========================================
// REGISTER DOCTOR
// ==========================================

const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      qualification,
      experience,
      fees,
      gender,
      image,
      password,
    } = req.body;

    console.log("========== DOCTOR REGISTRATION ==========");
    console.log("Request body:", req.body);
    console.log("Fees received:", fees);
    console.log("Fees type:", typeof fees);
    console.log("Number(fees):", Number(fees));
    console.log("=========================================");

    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({
      email: email.toLowerCase(),
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor
    const doctor = await Doctor.create({
      name,
      email: email.toLowerCase(),
      phone,
      specialization,
      qualification,
      experience: Number(experience),
      fees: Number(fees),
      gender,
      image: image || "",
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",

      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        fees: doctor.fees,
      },
    });
  } catch (error) {
    console.error("Doctor Registration Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ==========================================
// DOCTOR LOGIN
// ==========================================

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!doctor.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your doctor account has been deactivated",
      });
    }

    const passwordMatch = await bcrypt.compare(password, doctor.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        role: "doctor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Doctor login successful",
      token,

      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        fees: doctor.fees,
        gender: doctor.gender,
        image: doctor.image,
      },
    });
  } catch (error) {
    console.error("Doctor Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during doctor login",
    });
  }
};

// ==========================================
// GET ALL DOCTORS
// ==========================================

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get Doctors Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching doctors",
    });
  }
};

const forgotDoctorPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email",
      });
    }

    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
    }).select("+resetOTP +resetOTPExpiry");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "No doctor found with this email",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    doctor.resetOTP = hashedOTP;

    // OTP expires in 10 minutes
    doctor.resetOTPExpiry = Date.now() + 10 * 60 * 1000;

    await doctor.save();
    console.log("Doctor email:", doctor.email);
    console.log("OTP generated:", otp);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD loaded:", !!process.env.EMAIL_PASSWORD);
    // Send OTP
    await sendEmail({
      email: doctor.email,

      subject: "Bravos Hospital Password Reset OTP",

      message: `
Your password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot Doctor Password Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetDoctorPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find doctor including OTP fields
    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
    }).select("+password +resetOTP +resetOTPExpiry");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Hash entered OTP
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    // Check OTP
    if (doctor.resetOTP !== hashedOTP || doctor.resetOTPExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    doctor.password = hashedPassword;

    // Remove OTP
    doctor.resetOTP = undefined;
    doctor.resetOTPExpiry = undefined;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  registerDoctor,
  loginDoctor,
  getDoctors,
  forgotDoctorPassword,
  resetDoctorPassword,
};
