import API from "./productApi";

export const createOrder = async(orderData) => {
    const response = await API.post("/orders", orderData);

    return response.data;
};

export const getOrders = async() => {
    const response = await API.get("/orders");

    return response.data;
};

export const getOrderById = async(orderId) => {
    const response = await API.get(`/orders/${orderId}`);

    return response.data;
};