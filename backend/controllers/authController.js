const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (user) => {
    return jwt.sign({
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET, {
            expiresIn: "7d",
        }
    );
};

const registerUser = async(req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password
        ) {
            throw new AppError(400, "Name, email and password are required");
        }

        if (name.trim().length > 100) {
            throw new AppError(400, "Name is too long");
        }

        if (!EMAIL_PATTERN.test(email.trim())) {
            throw new AppError(400, "Please provide a valid email address");
        }

        if (password.length < 6) {
            throw new AppError(400, "Password must be at least 6 characters");
        }

        if (password.length > 128) {
            throw new AppError(400, "Password is too long");
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            throw new AppError(400, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user",
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError(400, "User with this email already exists"));
        }
        next(error);
    }
};

const loginUser = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
            throw new AppError(400, "Email and password are required");
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        // Same generic message whether the email doesn't exist or the
        // password is wrong — avoids leaking which emails are registered.
        if (!user) {
            throw new AppError(401, "Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw new AppError(401, "Invalid email or password");
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
};
