const Rsvp = require("../models/Rsvp");
const { sendAttendanceEmail } = require("../services/emailService");

exports.createRsvp = async (req, res) => {
  try {
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

    if (willAttend === "yes") {
      await sendAttendanceEmail(rsvp);
    }

    res.status(201).json({
      message: willAttend === "yes"
        ? "Thank you! Your RSVP was submitted and the couple has been notified."
        : "Thank you! Your RSVP was submitted.",
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
