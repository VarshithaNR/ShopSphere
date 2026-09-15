const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async(req, res) => {
    try {
        const {
            customer,
            items,
            totalAmount,
            paymentMethod,
        } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication is required",
            });
        }

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

        if (
            totalAmount === undefined ||
            typeof totalAmount !== "number" ||
            totalAmount < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid total amount is required",
            });
        }

        const allowedPaymentMethods = [
            "Cash on Delivery",
            "UPI",
            "Card",
        ];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }

        // Validate every product and latest stock
        for (const item of items) {
            if (!item.product ||
                !item.name ||
                typeof item.price !== "number" ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product information in order",
                });
            }

            const product = await Product.findById(
                item.product
            );

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

        // Reduce stock after all products pass validation
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product, {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        const order = await Order.create({
            user: req.user.id,
            customer,
            items,
            totalAmount,
            paymentMethod,
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
            .populate("user", "name email")
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

const getMyOrders = async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication is required",
            });
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
        console.error("Get my orders error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your orders",
        });
    }
};

const getMyOrderById = async(req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User authentication is required",
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id,
        }).populate("items.product");

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
        console.error("Get my order error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};

const getOrderById = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.product");

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

const updateOrderStatus = async(req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id, {
                status,
            }, {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error(
            "Update order status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
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