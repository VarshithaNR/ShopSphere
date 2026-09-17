import client from "./client";

export const getWishlist = async () => {
    const response = await client.get("/wishlist");
    return response.data;
};

export const addToWishlist = async (productId) => {
    const response = await client.post(`/wishlist/${productId}`);
    return response.data;
};

export const removeFromWishlist = async (productId) => {
    const response = await client.delete(`/wishlist/${productId}`);
    return response.data;
};
