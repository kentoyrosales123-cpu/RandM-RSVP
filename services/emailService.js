const nodemailer = require("nodemailer");

const requiredEnv = ["EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];

function getMissingEmailEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Server Ready");
  }
});

async function sendAttendanceEmail(rsvp) {
  try {
    const missingEnv = getMissingEmailEnv();
    if (missingEnv.length > 0) {
      throw new Error(`Missing email environment variable(s): ${missingEnv.join(", ")}`);
    }

    const attendance = rsvp.willAttend === "yes" ? "Yes, will attend" : "No, cannot attend";
    const message = rsvp.message || "No message";
    const info = await transporter.sendMail({
      from: `"Wedding RSVP" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: rsvp.email,
      subject: "New Wedding RSVP Confirmation",
      text: [
        "New RSVP Confirmation",
        `Name: ${rsvp.fullName}`,
        `Attendance: ${attendance}`,
        `Email: ${rsvp.email}`,
        `Phone: ${rsvp.phone}`,
        `Guests: ${rsvp.guestCount}`,
        `Message: ${message}`,
      ].join("\n"),
      html: `
        <h2>New RSVP Confirmation</h2>
        <p><strong>Name:</strong> ${rsvp.fullName}</p>
        <p><strong>Attendance:</strong> ${attendance}</p>
        <p><strong>Email:</strong> ${rsvp.email}</p>
        <p><strong>Phone:</strong> ${rsvp.phone}</p>
        <p><strong>Guests:</strong> ${rsvp.guestCount}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email failed:", error);
    throw error;
  }
}

module.exports = { sendAttendanceEmail };
