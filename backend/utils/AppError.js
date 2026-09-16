// Small helper for predictable, operational errors (bad input, not-found, etc.)
// so controllers can `throw` instead of duplicating res.status(...).json(...) everywhere.
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

module.exports = AppError;
