const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");
const { getMyProfile, updateMyProfile } = require("../controllers/profileController");

router.get("/me", authMiddleware, getMyProfile);
router.patch("/me", authMiddleware, (req, res, next) => {
  profileUpload.single("image")(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message });
    next();
  });
}, updateMyProfile);

module.exports = router;
