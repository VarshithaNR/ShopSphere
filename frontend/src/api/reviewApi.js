import client from "./client";

export const getProductReviews = async(productId) => {
    const response = await client.get(`/reviews/${productId}`);
    return response.data;
};

export const createReview = async({ productId, rating, comment }) => {
    const response = await client.post("/reviews", { productId, rating, comment });
    return response.data;
};
