const fs = require("fs");
const path = require("path");
const Patient = require("../models/patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

const getModel = (role) => {
  if (role === "patient") return Patient;
  if (role === "doctor") return Doctor;
  if (role === "admin") return Admin;
  return null;
};

const publicProfile = (doc, role) => {
  const data = doc.toObject ? doc.toObject() : doc;
  delete data.password;
  delete data.resetOTP;
  delete data.resetOTPExpiry;
  return { ...data, role };
};

const getMyProfile = async (req, res) => {
  try {
    const Model = getModel(req.user?.role);
    if (!Model) return res.status(403).json({ success: false, message: "Unsupported account role" });

    const profile = await Model.findById(req.user.id);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    return res.json({ success: true, profile: publicProfile(profile, req.user.role) });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Unable to load profile" });
  }
};

const updateMyProfile = async (req, res) => {
  let uploadedPath = req.file?.path;
  try {
    const role = req.user?.role;
    const Model = getModel(role);
    if (!Model) return res.status(403).json({ success: false, message: "Unsupported account role" });

    const profile = await Model.findById(req.user.id);
    if (!profile) { if (uploadedPath) fs.unlink(uploadedPath, () => {}); return res.status(404).json({ success: false, message: "Profile not found" }); }

    const allowedFields = role === "patient"
      ? ["name", "phone", "age", "gender"]
      : role === "doctor"
        ? ["name", "phone", "specialization", "qualification", "experience", "fees", "gender"]
        : ["name"];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (["age", "experience", "fees"].includes(field)) {
          const number = Number(req.body[field]);
          if (!Number.isFinite(number) || number < 0) {
            if (uploadedPath) fs.unlink(uploadedPath, () => {});
            return res.status(400).json({ success: false, message: `Invalid ${field}` });
          }
          profile[field] = number;
        } else {
          profile[field] = String(req.body[field]).trim();
        }
      }
    }

    if (req.file) {
      const oldImage = profile.image;
      profile.image = `/uploads/profiles/${req.file.filename}`;
      await profile.save();
      if (oldImage && oldImage.startsWith("/uploads/profiles/")) {
        const oldPath = path.join(__dirname, "..", oldImage.replace(/^\/uploads\/profiles\//, "uploads/profiles/"));
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
    } else {
      await profile.save();
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: publicProfile(profile, role),
    });
  } catch (error) {
    if (uploadedPath && fs.existsSync(uploadedPath)) fs.unlink(uploadedPath, () => {});
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to update profile" });
  }
};

module.exports = { getMyProfile, updateMyProfile };
