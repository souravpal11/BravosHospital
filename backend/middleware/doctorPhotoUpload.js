const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "uploads", "doctors");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = file.mimetype === "image/png" ? ".png" :
      file.mimetype === "image/webp" ? ".webp" : ".jpg";
    cb(null, `${crypto.randomBytes(16).toString("hex")}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  cb(allowed.includes(file.mimetype) ? null : new Error("Only JPG, PNG and WEBP images are allowed"), allowed.includes(file.mimetype));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});
