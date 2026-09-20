const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const existingAdmin = await Admin.findOne({
      email: "25it1so139@mitsgwl.ac.in",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    await Admin.create({
      name: "Bravos Hospital Administrator",
      email: "25it1so139@mitsgwl.ac.in",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();