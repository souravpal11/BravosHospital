const Patient = require("../models/patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// ==========================================
// REGISTER PATIENT
// EMAIL MUST BE VERIFIED FIRST
// ==========================================

const registerPatient = async (req, res) => {
  try {
    const {
      verificationToken,
      email,
      name,
      phone,
      age,
      gender,
      password,
    } = req.body;

    // Check required fields
    if (
      !verificationToken ||
      !email ||
      !name ||
      !phone ||
      !age ||
      !gender ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // VERIFY EMAIL VERIFICATION TOKEN
    // ==========================================

    let decodedToken;

    try {
      decodedToken = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          "Email verification has expired. Please verify your email again.",
      });
    }

    // Check token purpose
    if (
      decodedToken.role !== "patient" ||
      decodedToken.purpose !== "patient-registration-email"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email verification token",
      });
    }

    // Check email inside token
    if (decodedToken.email !== normalizedEmail) {
      return res.status(401).json({
        success: false,
        message: "Email verification does not match",
      });
    }

    // ==========================================
    // CHECK EXISTING PATIENT
    // ==========================================

    const existingPatient = await Patient.findOne({
      email: normalizedEmail,
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient already exists with this email",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // CREATE PATIENT
    // ==========================================

    const patient = await Patient.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      age,
      gender,
      password: hashedPassword,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
      },
    });
  } catch (error) {
    console.error("Register Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// LOGIN PATIENT
// ==========================================

const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const patient = await Patient.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      patient.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: patient._id,
        role: "patient",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
      },
    });
  } catch (error) {
    console.error("Login Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// FORGOT PATIENT PASSWORD
// ==========================================

const forgotPatientPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email",
      });
    }

    const patient = await Patient.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetOTP +resetOTPExpiry");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "No patient found with this email",
      });
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    patient.resetOTP = hashedOTP;

    // OTP expires in 10 minutes
    patient.resetOTPExpiry =
      Date.now() + 10 * 60 * 1000;

    await patient.save();

    await sendEmail({
      email: patient.email,
      subject: "Bravos Hospital Password Reset OTP",
      message: `
Your Bravos Hospital password reset OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error(
      "Forgot Patient Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// RESET PATIENT PASSWORD
// ==========================================

const resetPatientPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const patient = await Patient.findOne({
      email: email.toLowerCase().trim(),
    }).select(
      "+password +resetOTP +resetOTPExpiry"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (
      patient.resetOTP !== hashedOTP ||
      !patient.resetOTPExpiry ||
      patient.resetOTPExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    patient.password = hashedPassword;

    patient.resetOTP = undefined;
    patient.resetOTPExpiry = undefined;

    await patient.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error(
      "Reset Patient Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// SEND REGISTRATION OTP
// ==========================================

const sendPatientRegistrationOTP = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // Check existing account
    const existingPatient =
      await Patient.findOne({
        email: normalizedEmail,
      });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message:
          "An account already exists with this email",
      });
    }

    // Secure OTP
    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash OTP before storing
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const RegistrationOTP = require("../models/RegistrationOTP");

    // Delete previous OTP
    await RegistrationOTP.deleteOne({
      email: normalizedEmail,
      role: "patient",
    });

    // Create new OTP
    await RegistrationOTP.create({
      email: normalizedEmail,
      otp: hashedOTP,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
      role: "patient",
    });

    // Send email
    await sendEmail({
      email: normalizedEmail,
      subject:
        "Bravos Hospital - Email Verification OTP",
      message: `
Welcome to Bravos Hospital!

Your email verification OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not try to create a Bravos Hospital account,
please ignore this email.
      `,
    });

    res.status(200).json({
      success: true,
      message:
        "Verification OTP sent to your email",
    });
  } catch (error) {
    console.error(
      "Patient Registration OTP Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// VERIFY REGISTRATION OTP
// ==========================================

const verifyPatientRegistrationOTP = async (
  req,
  res
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // Find OTP record
    const RegistrationOTP = require("../models/RegistrationOTP");

    const registrationOTP =
      await RegistrationOTP.findOne({
        email: normalizedEmail,
        role: "patient",
      });

    if (!registrationOTP) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    // Check expiry
    if (
      registrationOTP.expiresAt < new Date()
    ) {
      await RegistrationOTP.deleteOne({
        _id: registrationOTP._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    // Hash entered OTP
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // Compare OTP
    if (registrationOTP.otp !== hashedOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ==========================================
    // OTP VERIFIED
    // ==========================================

    // Delete OTP immediately
    await RegistrationOTP.deleteOne({
      _id: registrationOTP._id,
    });

    // Create short-lived verification token
    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        role: "patient",
        purpose: "patient-registration-email",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      verificationToken,
    });
  } catch (error) {
    console.error(
      "Patient Registration Verification Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  registerPatient,
  loginPatient,
  forgotPatientPassword,
  resetPatientPassword,
  sendPatientRegistrationOTP,
  verifyPatientRegistrationOTP,
};