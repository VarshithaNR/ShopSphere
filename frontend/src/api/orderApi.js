import API from "./productApi";

export const createOrder = async(orderData) => {
    const token = localStorage.getItem("token");

    const response = await API.post("/orders", orderData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const getOrders = async() => {
    const token = localStorage.getItem("token");

    const response = await API.get("/orders", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const getOrderById = async(orderId) => {
    const token = localStorage.getItem("token");

    const response = await API.get(`/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};