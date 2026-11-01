const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { adminReports } = require("../controllers/adminReportsController");
const router = express.Router();
router.get("/", authMiddleware, adminReports);
module.exports = router;
