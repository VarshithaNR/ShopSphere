const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const securityHeaders = require("./middleware/securityHeaders");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// Render/Railway/Vercel sit behind a reverse proxy — needed for correct
// client IPs (rate limiting) and secure cookies/HTTPS detection.
app.set("trust proxy", 1);

app.use(securityHeaders);

// In production, only allow the deployed frontend origin(s). In development,
// fall back to allowing any origin so localhost works without extra setup.
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser requests (curl, server-to-server, health checks)
            // which don't send an Origin header at all.
            if (!origin) return callback(null, true);

            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere backend is running!",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        dbConnected: mongoose.connection.readyState === 1,
    });
});

// Auth routes handle their own rate limiting internally, scoped to just
// the register/login endpoints (see routes/authRoutes.js).
app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Anything that doesn't match a route above.
app.use(notFound);

// Centralized error handler — must be registered last.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
        process.exit(1);
    });

// Prevent the process from crashing silently on an unhandled promise rejection;
// log it so a process manager (Render/Railway) can be configured to restart cleanly.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
