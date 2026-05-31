const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    guestCount: { type: Number, required: true, min: 1, max: 20 },
    willAttend: { type: String, enum: ["yes", "no"], required: true },
    message: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rsvp", rsvpSchema);
