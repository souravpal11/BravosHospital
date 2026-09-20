const express = require("express");

const {
  createContactMessage,
  getContactMessages,
} = require("../controllers/contactController");

const router = express.Router();


// Patient sends message
router.post("/", createContactMessage);


// Admin gets messages
router.get("/", getContactMessages);


module.exports = router;