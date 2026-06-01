const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAttendanceEmail(rsvp) {
  try {
    const willAttend = String(rsvp.willAttend || "").toLowerCase();

    if (willAttend !== "yes") {
      console.log(
        "ℹ️ RSVP saved but email skipped. willAttend:",
        rsvp.willAttend,
      );
      return;
    }

    const info = await transporter.sendMail({
      from: `"Wedding RSVP" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: "New Wedding RSVP Confirmation",
      html: `
        <h2>New RSVP Confirmation</h2>
        <p><strong>Name:</strong> ${rsvp.fullName}</p>
        <p><strong>Email:</strong> ${rsvp.email}</p>
        <p><strong>Phone:</strong> ${rsvp.phone}</p>
        <p><strong>Guests:</strong> ${rsvp.guestCount}</p>
        <p><strong>Message:</strong> ${rsvp.message || "No message"}</p>
      `,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Email failed:", error.message);
  }
}

module.exports = { sendAttendanceEmail };
