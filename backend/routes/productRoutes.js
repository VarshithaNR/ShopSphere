const express = require("express");

const {
    getProducts,
    createProduct,
    getProductById,
    getRelatedProducts,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getProducts);

router.post("/", protect, admin, createProduct);

// Must come before "/:id" so "related" in "/:id/related" isn't swallowed by it.
router.get("/:id/related", getRelatedProducts);

router.get("/:id", getProductById);

router.put("/:id", protect, admin, updateProduct);

router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
