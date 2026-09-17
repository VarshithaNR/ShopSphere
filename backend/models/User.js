const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    // Simple array-of-references wishlist — enough for one user's saved
    // products without the overhead of a separate collection.
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;