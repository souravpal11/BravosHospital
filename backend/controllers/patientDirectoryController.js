const Patient = require("../models/patient");

// Admin-only directory endpoint. Never return credentials or password reset fields.
const getAllPatients = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only administrators can view all patients." });
    }
    const patients = await Patient.find({})
      .select("name email phone age gender createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, patients });
  } catch (error) {
    console.error("Get patients error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch patients." });
  }
};

module.exports = { getAllPatients };
