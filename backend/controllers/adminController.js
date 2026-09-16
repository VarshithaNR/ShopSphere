const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

// GET /api/admin/stats
// Aggregates the numbers an admin dashboard needs. Runs the counts in
// parallel since they're independent of each other.
const getDashboardStats = async(req, res, next) => {
    try {
        const [
            totalProducts,
            totalOrders,
            totalCustomers,
            lowStockProducts,
            pendingOrders,
            deliveredOrders,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ role: "user" }),
            Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
            Order.countDocuments({ status: "Pending" }),
            Order.countDocuments({ status: "Delivered" }),
            Order.aggregate([
                { $match: { status: { $ne: "Cancelled" } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Order.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        const outOfStockProducts = await Product.countDocuments({ stock: 0 });

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalCustomers,
                totalSales: revenueResult[0]?.total || 0,
                pendingOrders,
                deliveredOrders,
                lowStockProducts,
                outOfStockProducts,
            },
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };
