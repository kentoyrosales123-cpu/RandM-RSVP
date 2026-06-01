const Rsvp = require("../models/Rsvp");
const { sendAttendanceEmail } = require("../services/emailService");
const mongoose = require("mongoose");

exports.createRsvp = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "RSVP database is not connected. Please check the Render MONGODB_URI setting.",
      });
    }

    const { fullName, email, phone, guestCount, willAttend, message } = req.body;

    if (!fullName || !email || !phone || !guestCount || !willAttend) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    if (!["yes", "no"].includes(willAttend)) {
      return res.status(400).json({ message: "Invalid attendance response." });
    }

    const rsvp = await Rsvp.create({
      fullName,
      email,
      phone,
      guestCount: Number(guestCount),
      willAttend,
      message,
    });

    try {
      await sendAttendanceEmail(rsvp);
    } catch (error) {
      return res.status(201).json({
        message: "Thank you! Your RSVP was submitted, but the email notification could not be sent.",
        emailSent: false,
        rsvp,
      });
    }

    res.status(201).json({
      message: "Thank you! Your RSVP was submitted and the couple has been notified.",
      emailSent: true,
      rsvp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRsvps = async (req, res) => {
  try {
    const rsvps = await Rsvp.find().sort({ createdAt: -1 });
    res.json(rsvps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
