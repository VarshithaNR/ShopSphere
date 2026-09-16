const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const isValidObjectId = require("../utils/validateObjectId");

const ALLOWED_PAYMENT_METHODS = ["Cash on Delivery", "UPI", "Card"];

const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0;

const validateCustomer = (customer) => {
    if (
        !customer ||
        !isNonEmptyString(customer.fullName) ||
        !isNonEmptyString(customer.email) ||
        !isNonEmptyString(customer.phone) ||
        !isNonEmptyString(customer.address)
    ) {
        throw new AppError(400, "Complete shipping information is required");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(customer.email.trim())) {
        throw new AppError(400, "A valid email address is required");
    }

    const phonePattern = /^[0-9+\-\s()]{7,20}$/;
    if (!phonePattern.test(customer.phone.trim())) {
        throw new AppError(400, "A valid phone number is required");
    }
};

// Creates an order. Price and totalAmount are NEVER trusted from the client —
// they are always recalculated from the current product prices in MongoDB.
// Stock is decremented atomically per item inside a transaction so two
// concurrent orders can't both succeed against the same last unit of stock.
const createOrder = async(req, res, next) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (!req.user || !req.user.id) {
            throw new AppError(401, "User authentication is required");
        }

        const { customer, items, paymentMethod } = req.body;

        validateCustomer(customer);

        if (!Array.isArray(items) || items.length === 0) {
            throw new AppError(400, "Order must contain at least one product");
        }

        if (items.length > 100) {
            throw new AppError(400, "Order contains too many line items");
        }

        if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
            throw new AppError(400, "Invalid payment method");
        }

        // Merge duplicate product IDs so a crafted payload with the same
        // product listed twice can't be used to bypass the stock check.
        const quantityByProduct = new Map();
        for (const rawItem of items) {
            if (
                !rawItem ||
                !isValidObjectId(rawItem.product) ||
                !Number.isInteger(rawItem.quantity) ||
                rawItem.quantity < 1 ||
                rawItem.quantity > 1000
            ) {
                throw new AppError(400, "Invalid product or quantity in order");
            }

            const productId = String(rawItem.product);
            const existingQty = quantityByProduct.get(productId) || 0;
            quantityByProduct.set(productId, existingQty + rawItem.quantity);
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const [productId, quantity] of quantityByProduct.entries()) {
            // Atomic "check stock AND decrement" in one operation — this is
            // what actually prevents the race condition, not just the
            // transaction wrapper around it.
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: productId, stock: { $gte: quantity } },
                { $inc: { stock: -quantity } },
                { new: true, session }
            );

            if (!updatedProduct) {
                const existingProduct = await Product.findById(productId).session(session);

                if (!existingProduct) {
                    throw new AppError(404, "One or more products in your order no longer exist");
                }

                throw new AppError(
                    400,
                    `Not enough stock for ${existingProduct.name}. Available: ${existingProduct.stock}`
                );
            }

            // Server-computed price — the client's price/totalAmount is never used.
            const lineTotal = updatedProduct.price * quantity;
            totalAmount += lineTotal;

            orderItems.push({
                product: updatedProduct._id,
                name: updatedProduct.name,
                price: updatedProduct.price,
                quantity,
            });
        }

        const createdOrders = await Order.create(
            [{
                user: req.user.id,
                customer: {
                    fullName: customer.fullName.trim(),
                    email: customer.email.trim().toLowerCase(),
                    phone: customer.phone.trim(),
                    address: customer.address.trim(),
                },
                items: orderItems,
                totalAmount: Number(totalAmount.toFixed(2)),
                paymentMethod,
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: createdOrders[0],
        });
    } catch (error) {
        await session.abortTransaction().catch(() => {});
        session.endSession();
        next(error);
    }
};

const getOrders = async(req, res, next) => {
    try {
        const { status, search } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (search && search.trim()) {
            const term = search.trim();
            const orClauses = [
                { "customer.fullName": { $regex: term, $options: "i" } },
                { "customer.email": { $regex: term, $options: "i" } },
            ];

            if (isValidObjectId(term)) {
                orClauses.push({ _id: term });
            }

            filter.$or = orClauses;
        }

        const orders = await Order.find(filter)
            .populate("user", "name email")
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

const getMyOrders = async(req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new AppError(401, "User authentication is required");
        }

        const orders = await Order.find({
                user: req.user.id,
            })
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

const getMyOrderById = async(req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new AppError(401, "User authentication is required");
        }

        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid order ID");
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id,
        }).populate("items.product");

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid order ID");
        }

        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.product");

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async(req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            throw new AppError(400, "Invalid order ID");
        }

        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            throw new AppError(400, "Invalid order status");
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, {
                status,
            }, {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrders,
    getMyOrders,
    getMyOrderById,
    getOrderById,
    updateOrderStatus,
};
