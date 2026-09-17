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

const getMe = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            throw new AppError(404, "User not found");
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/auth/profile — only name is editable here. Email changes are
// intentionally out of scope (it's also the login identifier), and role is
// never accepted from the client under any circumstance.
const updateProfile = async(req, res, next) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            throw new AppError(400, "Name is required");
        }

        if (name.trim().length > 100) {
            throw new AppError(400, "Name is too long");
        }

        const user = await User.findByIdAndUpdate(
            req.user.id, { name: name.trim() }, { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            throw new AppError(404, "User not found");
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
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

const changePassword = async(req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new AppError(400, "Current password, new password and confirmation are required");
        }

        if (newPassword.length < 6 || newPassword.length > 128) {
            throw new AppError(400, "New password must be between 6 and 128 characters");
        }

        if (newPassword !== confirmPassword) {
            throw new AppError(400, "New password and confirmation do not match");
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            throw new AppError(404, "User not found");
        }

        const currentMatches = await bcrypt.compare(currentPassword, user.password);

        if (!currentMatches) {
            throw new AppError(401, "Current password is incorrect");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
};
