const express = require("express");

const {
    createReview,
    getProductReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);

router.get("/:productId", getProductReviews);

module.exports = router;