const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully!");

        const adminEmail = "admin@shopsphere.com";
        const adminPassword = "admin123";

        const existingAdmin = await User.findOne({
            email: adminEmail,
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
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });

        console.log("Admin account created successfully!");
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);

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