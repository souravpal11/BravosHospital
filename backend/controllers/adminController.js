const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,

      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};

const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+resetOTP +resetOTPExpiry");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "No admin found with this email",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Hash OTP before storing
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    admin.resetOTP = hashedOTP;

    // OTP expires after 10 minutes
    admin.resetOTPExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await admin.save();

    await sendEmail({
      email: admin.email,
      subject: "Bravos Hospital Admin Password Reset OTP",
      message: `
Your Bravos Hospital admin password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
      `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot Admin Password Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

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

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password +resetOTP +resetOTPExpiry");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (
      admin.resetOTP !== hashedOTP ||
      !admin.resetOTPExpiry ||
      admin.resetOTPExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    admin.password = hashedPassword;

    // Remove used OTP
    admin.resetOTP = undefined;
    admin.resetOTPExpiry = undefined;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error("Reset Admin Password Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
  forgotAdminPassword,
  resetAdminPassword,
};