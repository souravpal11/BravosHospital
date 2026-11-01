const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getAllPatients } = require("../controllers/patientDirectoryController");
const router = express.Router();
router.get("/", authMiddleware, getAllPatients);
module.exports = router;
