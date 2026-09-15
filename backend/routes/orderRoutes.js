const express = require("express");

const {
    createOrder,
    getMyOrders,
    getMyOrderById,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getMyOrders);

router.get("/:id", protect, getMyOrderById);

module.exports = router;