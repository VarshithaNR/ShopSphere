const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const isValidObjectId = require("../utils/validateObjectId");
const escapeRegex = require("../utils/escapeRegex");

// Fields an admin is allowed to set when creating/editing a product.
// Anything else in the request body (e.g. rating, _id, timestamps) is ignored,
// preventing mass-assignment of fields that should only be system-managed.
const ALLOWED_PRODUCT_FIELDS = [
    "name",
    "description",
    "price",
    "category",
    "brand",
    "image",
    "stock",
];

const pickAllowedFields = (body) => {
    const result = {};
    for (const field of ALLOWED_PRODUCT_FIELDS) {
        if (body[field] !== undefined) {
            result[field] = body[field];
        }
    }
    return result;
};

const validateProductPayload = (data, { partial = false } = {}) => {
    const required = ["name", "description", "price", "category", "brand", "image", "stock"];

    if (!partial) {
        for (const field of required) {
            if (data[field] === undefined || data[field] === null || data[field] === "") {
                throw new AppError(400, `${field} is required`);
            }
        }
    }

    if (data.price !== undefined) {
        const price = Number(data.price);
        if (Number.isNaN(price) || price < 0) {
            throw new AppError(400, "Price must be a non-negative number");
        }
        data.price = price;
    }

    if (data.stock !== undefined) {
        if (!Number.isInteger(Number(data.stock)) || Number(data.stock) < 0) {
            throw new AppError(400, "Stock must be a non-negative whole number");
        }
        data.stock = Number(data.stock);
    }

    for (const field of ["name", "description", "category", "brand", "image"]) {
        if (data[field] !== undefined) {
            if (typeof data[field] !== "string" || !data[field].trim()) {
                throw new AppError(400, `${field} must be a non-empty string`);
            }
            data[field] = data[field].trim();
        }
    }
};

// GET /api/products
// Supports: search (name, case-insensitive), category, minPrice, maxPrice, sort.
// All filtering happens in MongoDB so the API stays real/usable at scale
// rather than returning everything and relying on the frontend to filter.
const getProducts = async(req, res, next) => {
    try {
        const { search, category, minPrice, maxPrice, sort, inStock, page, limit } = req.query;
        const filter = {};

        if (search && search.trim()) {
            const safeTerm = escapeRegex(search.trim());
            filter.name = { $regex: safeTerm, $options: "i" };
        }

        if (category && category.trim() && category.trim().toLowerCase() !== "all") {
            filter.category = category.trim();
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined && !Number.isNaN(Number(minPrice))) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice !== undefined && !Number.isNaN(Number(maxPrice))) {
                filter.price.$lte = Number(maxPrice);
            }
            if (Object.keys(filter.price).length === 0) {
                delete filter.price;
            }
        }

        if (inStock === "true") {
            filter.stock = { $gt: 0 };
        }

        const sortMap = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            rating_desc: { rating: -1 },
            name_asc: { name: 1 },
            newest: { createdAt: -1 },
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        // Pagination is optional and additive: omit page/limit and you get the
        // full filtered list (unchanged behavior, used by the admin product list).
        // Pass page/limit for the public product grid.
        if (page || limit) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

            const [products, total] = await Promise.all([
                Product.find(filter)
                    .sort(sortOption)
                    .skip((pageNum - 1) * limitNum)
                    .limit(limitNum),
                Product.countDocuments(filter),
            ]);

            return res.status(200).json({
                success: true,
                count: products.length,
                total,
                page: pageNum,
                totalPages: Math.max(1, Math.ceil(total / limitNum)),
                products,
            });
        }

        const products = await Product.find(filter).sort(sortOption);

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async(req, res, next) => {
    try {
        const data = pickAllowedFields(req.body);
        validateProductPayload(data);

        const product = await Product.create(data);

        res.status(201).json({
            success: true,
            product,
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid product ID");
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid product ID");
        }

        const data = pickAllowedFields(req.body);
        validateProductPayload(data, { partial: true });

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            data, {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid product ID");
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
};
