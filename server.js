const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const requiredEnv = ["MONGODB_URI", "EMAIL_USER", "EMAIL_PASS", "EMAIL_TO"];

function getMissingEnv() {
  return requiredEnv.filter((key) => !process.env[key]);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databaseConnected: mongoose.connection.readyState === 1,
    missingEnv: getMissingEnv(),
  });
});

app.use("/api/rsvps", require("./routes/rsvpRoutes"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

if (!process.env.MONGODB_URI) {
  console.error("MongoDB connection skipped: missing MONGODB_URI");
} else {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
}
