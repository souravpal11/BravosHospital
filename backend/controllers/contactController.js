const ContactMessage = require("../models/ContactMessage");


// ==========================================
// SEND CONTACT MESSAGE
// ==========================================

const createContactMessage = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;


    // Validation

    if (
      !name ||
      !email ||
      !phone ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }


    // Create message

    const contactMessage =
      await ContactMessage.create({
        name,
        email,
        phone,
        subject,
        message,
      });


    res.status(201).json({
      success: true,
      message:
        "Your message has been sent successfully.",
      contactMessage,
    });


  } catch (error) {

    console.error(
      "Contact Message Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while sending message",
    });

  }
};


// ==========================================
// GET ALL CONTACT MESSAGES
// ==========================================

const getContactMessages = async (req, res) => {

  try {

    const messages =
      await ContactMessage.find()
        .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      messages,
    });


  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching messages",
    });

  }
};


module.exports = {
  createContactMessage,
  getContactMessages,
};