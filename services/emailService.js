const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

async function sendAttendanceEmail(rsvp) {
  try {
    if (rsvp.willAttend !== "yes") return;

    await transporter.sendMail({
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

    console.log("RSVP email sent successfully");
  } catch (error) {
    console.error("EMAIL ERROR:", error.message);
  }
}

module.exports = { sendAttendanceEmail };
