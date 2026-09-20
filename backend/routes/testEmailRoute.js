const express = require("express");
const router = express.Router();

const sendEmail = require("../utils/sendEmail");

router.post("/send-test-email", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { email } = req.body;

    console.log("Sending email to:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await sendEmail({
      email,
      subject: "Bravos Hospital Email Test",
      message: "Congratulations! Your email service is working successfully.",
    });

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
    });

  } catch (error) {
    console.error("Email Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;