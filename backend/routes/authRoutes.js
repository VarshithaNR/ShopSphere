const express = require("express");

const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");

const router = express.Router();

// Only the brute-forceable, unauthenticated entry points are rate-limited —
// not the whole /api/auth path, so normal account usage (checking /me on
// every page load, etc.) is never throttled.
const authAttemptLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/register", authAttemptLimiter, registerUser);

router.post("/login", authAttemptLimiter, loginUser);

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

module.exports = router;
