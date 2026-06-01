const nodemailer = require("nodemailer");
const { Resend } = require("resend");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getEmailProvider() {
  return process.env.RESEND_API_KEY ? "resend" : "smtp";
}

function getMissingEmailEnv() {
  const required = ["EMAIL_TO"];

  if (getEmailProvider() === "resend") {
    required.push("RESEND_API_KEY");
  } else {
    required.push("EMAIL_USER", "EMAIL_PASS");
  }

  return required.filter((key) => !process.env[key]);
}

function buildEmail(rsvp) {
  const attendance = rsvp.willAttend === "yes" ? "Yes, will attend" : "No, cannot attend";
  const message = rsvp.message || "No message";

  return {
    attendance,
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
      <p><strong>Name:</strong> ${escapeHtml(rsvp.fullName)}</p>
      <p><strong>Attendance:</strong> ${escapeHtml(attendance)}</p>
      <p><strong>Email:</strong> ${escapeHtml(rsvp.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(rsvp.phone)}</p>
      <p><strong>Guests:</strong> ${escapeHtml(rsvp.guestCount)}</p>
      <p><strong>Message:</strong> ${escapeHtml(message)}</p>
    `,
  };
}

async function sendWithResend(rsvp, email) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM || "Wedding RSVP <onboarding@resend.dev>";

  const result = await resend.emails.send({
    from,
    to: process.env.EMAIL_TO,
    replyTo: rsvp.email,
    subject: "New Wedding RSVP Confirmation",
    text: email.text,
    html: email.html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  console.log("Email sent with Resend:", result.data.id);
}

async function sendWithSmtp(rsvp, email) {
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

  const info = await transporter.sendMail({
    from: `"Wedding RSVP" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: rsvp.email,
    subject: "New Wedding RSVP Confirmation",
    text: email.text,
    html: email.html,
  });

  console.log("Email sent with SMTP:", info.response);
}

async function sendAttendanceEmail(rsvp) {
  try {
    const missingEnv = getMissingEmailEnv();
    if (missingEnv.length > 0) {
      throw new Error(`Missing email environment variable(s): ${missingEnv.join(", ")}`);
    }

    const email = buildEmail(rsvp);

    if (getEmailProvider() === "resend") {
      await sendWithResend(rsvp, email);
    } else {
      await sendWithSmtp(rsvp, email);
    }
  } catch (error) {
    console.error("Email failed:", error);
    throw error;
  }
}

module.exports = { sendAttendanceEmail };
