const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully!");

        // Override via ADMIN_EMAIL / ADMIN_PASSWORD env vars for anything
        // beyond local development — never ship the default password.
        const adminEmail = process.env.ADMIN_EMAIL || "admin@shopsphere.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (adminPassword.length < 6) {
            console.error("ADMIN_PASSWORD must be at least 6 characters.");
            process.exit(1);
        }

        const existingAdmin = await User.findOne({
            email: adminEmail.toLowerCase(),
        });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            10
        );

        await User.create({
            name: "ShopSphere Admin",
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin account created successfully!");
        console.log("Email:", adminEmail);
        if (!process.env.ADMIN_PASSWORD) {
            console.log("Password: admin123 (default — set ADMIN_PASSWORD env var to change this, and log in and update it)");
        } else {
            console.log("Password: (set from ADMIN_PASSWORD env var)");
        }

        process.exit(0);
    } catch (error) {
        console.error(
            "Failed to create admin:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();