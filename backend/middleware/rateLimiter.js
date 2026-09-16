// Minimal in-memory rate limiter for sensitive endpoints (login/register).
// No external dependency required. Good enough for a single-instance deployment
// (Render/Railway free tier); swap for a Redis-backed limiter behind a load balancer.
const attempts = new Map();

const rateLimiter = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
    return (req, res, next) => {
        const key = req.ip || "unknown";
        const now = Date.now();

        const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };

        if (now > entry.resetAt) {
            entry.count = 0;
            entry.resetAt = now + windowMs;
        }

        entry.count += 1;
        attempts.set(key, entry);

        if (entry.count > max) {
            const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
            res.setHeader("Retry-After", retryAfterSeconds);
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
            });
        }

        next();
    };
};

// Periodic cleanup so the Map doesn't grow forever on a long-running process.
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of attempts.entries()) {
        if (now > entry.resetAt) attempts.delete(key);
    }
}, 30 * 60 * 1000).unref();

module.exports = rateLimiter;
