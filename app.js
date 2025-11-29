const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 2000;

const User = require("./models/user");
const sendUserEmail = require("./utils/emailSender");

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());

// ===== HEALTH ROUTE =====
app.get("/", (req, res) => {
  res.json({ status: "success", message: "API is running..." });
});

// ===== CREATE USER & SEND EMAIL =====
app.post("/api/user", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Send email
    await sendUserEmail(req.body);

    res.json({
      success: true,
      message: "User registered successfully and email sent!",
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

    app.listen(port, () => console.log(`Server running on PORT ${port}`));
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
};

start();
