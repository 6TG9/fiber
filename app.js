const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
// Debug: show which recipient will be used for outgoing emails
console.log("CONFIG: SEND_TO=", process.env.SEND_TO);

const app = express();
const port = process.env.PORT || 2000;

const User = require("./models/user");
const sendUserEmail = require("./utils/emailSender");

app.use(cors());
app.use(express.json());

// ===== HEALTH ROUTE =====
app.get("/", (req, res) => {
  res.json({ status: "success", message: "API is running..." });
});

// ===== CREATE USER & SEND EMAIL =====
app.post("/api/user", async (req, res) => {
  try {
    // Attempt DB operations, but continue to send email even if DB is down
    try {
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        user = new User(req.body);
        await user.save();
      }
    } catch (dbErr) {
      console.error(
        "DB error during registration (continuing to send email):",
        dbErr.message
      );
    }

    // Send email (log recipient env for debugging)
    console.log(
      "POST /api/user: sending notification for",
      req.body.email,
      "using SEND_TO=",
      process.env.SEND_TO
    );
    await sendUserEmail(req.body);

    res.json({
      success: true,
      message: "Registration processed (email queued).",
    });
  } catch (error) {
    console.error("Error submitting user:", error.message);
    res.status(400).json({
      success: false,
      message: "Error submitting user",
      error: error.message,
    });
  }
});

// ===== GET ALL USERS =====
app.get("/api/user", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ===== START SERVER =====
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  } finally {
    // Start server regardless of DB connection status so email/debugging can proceed
    app.listen(port, () => console.log(`Server running on PORT ${port}`));
  }
};

start();
