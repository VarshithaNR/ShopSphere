const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },

    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

// Enforces "one review per user per product" at the database level so a
// race between two simultaneous requests can never create duplicates,
// even though the controller also checks this before inserting.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;