const express = require("express");

const {
    getOrders,
    getOrderById,
    updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", protect, admin, getOrders);

router.get("/:id", protect, admin, getOrderById);

router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;