const express = require("express");

const {
  loginAdmin,
  forgotAdminPassword,
  resetAdminPassword,
} = require("../controllers/adminController");

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);

module.exports = router;