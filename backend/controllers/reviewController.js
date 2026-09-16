const Review = require("../models/Review");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const isValidObjectId = require("../utils/validateObjectId");

const recalculateProductRating = async(productId) => {
    const reviews = await Review.find({ product: productId });

    const averageRating = reviews.length === 0 ?
        0 :
        reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        rating: Number(averageRating.toFixed(1)),
    });
};

const createReview = async(req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new AppError(401, "User authentication is required");
        }

        const { productId, rating, comment } = req.body;

        if (!isValidObjectId(productId)) {
            throw new AppError(400, "Invalid product ID");
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            throw new AppError(400, "Rating must be a whole number between 1 and 5");
        }

        if (typeof comment !== "string" || !comment.trim()) {
            throw new AppError(400, "A review comment is required");
        }

        if (comment.trim().length > 1000) {
            throw new AppError(400, "Review comment is too long (max 1000 characters)");
        }

        const product = await Product.findById(productId);

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        const existingReview = await Review.findOne({
            product: productId,
            user: req.user.id,
        });

        if (existingReview) {
            throw new AppError(400, "You have already reviewed this product");
        }

        const review = await Review.create({
            product: productId,
            user: req.user.id,
            rating: numericRating,
            comment: comment.trim(),
        });

        await recalculateProductRating(productId);

        const populatedReview = await review.populate("user", "name");

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review: populatedReview,
        });
    } catch (error) {
        // Handle the rare race where two requests from the same user pass the
        // duplicate check simultaneously — the unique index (see Review model)
        // catches it at the database level.
        if (error.code === 11000) {
            return next(new AppError(400, "You have already reviewed this product"));
        }
        next(error);
    }
};

const getProductReviews = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.productId)) {
            throw new AppError(400, "Invalid product ID");
        }

        const reviews = await Review.find({
                product: req.params.productId,
            })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getProductReviews,
};
