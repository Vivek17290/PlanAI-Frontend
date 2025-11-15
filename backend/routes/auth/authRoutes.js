const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const newUser = await User.create({ username, email, password });
    res.json({ success: true, message: "Signup successful", user: newUser });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email not found" });
    }

    if (user.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, message: "Login successful", user });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
