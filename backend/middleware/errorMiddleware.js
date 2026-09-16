// Catches any request to a route that doesn't exist.
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

// Centralized error handler. Anything an async controller passes to next(err),
// plus errors from AppError, land here instead of leaking stack traces or
// generic 500s to the client.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Operational errors we threw on purpose (AppError) already know their status code.
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong on the server";

    // Mongoose sends a raw CastError when an ID string isn't a valid ObjectId.
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Mongoose validation errors (e.g. failed schema rules).
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // Duplicate key error (e.g. registering with an email that already exists,
    // if it ever reaches here instead of being caught earlier).
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = field ?
            `${field} is already in use` :
            "Duplicate value";
    }

    if (process.env.NODE_ENV !== "production") {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = { notFound, errorHandler };
