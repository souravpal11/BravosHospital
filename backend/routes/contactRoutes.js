const express = require("express");

const {
  createContactMessage,
  getContactMessages,
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Public endpoint: patients can submit enquiries.
router.post("/", createContactMessage);

// Private endpoint: only authenticated administrators can read enquiries.
router.get("/", authMiddleware, (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }
  next();
}, getContactMessages);

module.exports = router;
