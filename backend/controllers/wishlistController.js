const User = require("../models/User");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const isValidObjectId = require("../utils/validateObjectId");

// GET /api/wishlist — the logged-in user's own wishlist only.
const getWishlist = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");

        if (!user) {
            throw new AppError(404, "User not found");
        }

        res.status(200).json({
            success: true,
            wishlist: user.wishlist,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/wishlist/:productId — adds a product to the caller's own
// wishlist. $addToSet makes this naturally duplicate-proof and atomic.
const addToWishlist = async(req, res, next) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            throw new AppError(400, "Invalid product ID");
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError(404, "Product not found");
        }

        const user = await User.findByIdAndUpdate(
            req.user.id, { $addToSet: { wishlist: productId } }, { new: true }
        ).populate("wishlist");

        res.status(200).json({
            success: true,
            message: "Added to wishlist",
            wishlist: user.wishlist,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async(req, res, next) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
            throw new AppError(400, "Invalid product ID");
        }

        const user = await User.findByIdAndUpdate(
            req.user.id, { $pull: { wishlist: productId } }, { new: true }
        ).populate("wishlist");

        if (!user) {
            throw new AppError(404, "User not found");
        }

        res.status(200).json({
            success: true,
            message: "Removed from wishlist",
            wishlist: user.wishlist,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
