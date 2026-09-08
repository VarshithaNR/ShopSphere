const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async(req, res) => {
    try {
        const { customer, items, totalAmount } = req.body;

        if (!customer ||
            !customer.fullName ||
            !customer.email ||
            !customer.phone ||
            !customer.address
        ) {
            return res.status(400).json({
                success: false,
                message: "Customer information is required",
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order must contain at least one product",
            });
        }

        if (totalAmount === undefined || totalAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid total amount is required",
            });
        }

        // Check stock for every product
        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.name}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name}. Available stock: ${product.stock}`,
                });
            }
        }

        // Reduce stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: {
                    stock: -item.quantity,
                },
            });
        }

        // Create order
        const order = await Order.create({
            customer,
            items,
            totalAmount,
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};

const getOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

const getOrderById = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "items.product"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
};