const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const testEmailRoute = require("./routes/testEmailRoute");
const clinicalRoutes = require("./routes/clinicalRoutes");
const profileRoutes = require("./routes/profileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/gallery", galleryRoutes);
// Only the public gallery folder is served statically. Patient medical reports
// remain private and are downloaded through authenticated clinical endpoints.
app.use("/uploads/gallery", express.static(path.join(__dirname, "uploads", "gallery")));
app.use("/api/appointments", appointmentRoutes);
app.use("/api/clinical", clinicalRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/uploads/profiles", express.static(path.join(__dirname, "uploads", "profiles")));
app.use("/uploads/doctors", express.static(path.join(__dirname, "uploads", "doctors")));
app.use("/api/test", testEmailRoute);

// Test
app.get("/", (req, res) => {
  res.json({
    message: "Bravos Hospital Backend is Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
