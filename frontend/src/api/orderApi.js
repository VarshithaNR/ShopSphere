import client from "./client";

export const createOrder = async(orderData) => {
    const response = await client.post("/orders", orderData);
    return response.data;
};

export const getMyOrders = async() => {
    const response = await client.get("/orders");
    return response.data;
};

export const getMyOrderById = async(orderId) => {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
};

// Admin-only endpoints
export const getAllOrders = async(params = {}) => {
    const response = await client.get("/admin/orders", { params });
    return response.data;
};

export const getOrderByIdAdmin = async(orderId) => {
    const response = await client.get(`/admin/orders/${orderId}`);
    return response.data;
};

export const updateOrderStatus = async(orderId, status) => {
    const response = await client.put(`/admin/orders/${orderId}/status`, { status });
    return response.data;
};
