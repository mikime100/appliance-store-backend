const express = require("express");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const router = express.Router();

// Helpers
function getEnv(name, fallback) {
  return process.env[name] && process.env[name].length > 0
    ? process.env[name]
    : fallback;
}

const ADMIN_USERNAME = getEnv("ADMIN_USERNAME", "admin");
const ADMIN_PASSWORD = getEnv("ADMIN_PASSWORD", "admin123");
const ADMIN_JWT_SECRET = getEnv("ADMIN_JWT_SECRET", "change_this_secret");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, ADMIN_JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, token, user: { username } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/admin/verify
router.get("/verify", (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    const token = parts.length === 2 ? parts[1] : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing token" });
    }
    jwt.verify(token, ADMIN_JWT_SECRET);
    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

module.exports = router;


