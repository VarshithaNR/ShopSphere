import client from "./client";

// `params` may include: search, category, minPrice, maxPrice, sort, inStock, page, limit
export const getProducts = async(params = {}) => {
    const response = await client.get("/products", { params });
    return response.data;
};

export const getProductById = async(id) => {
    const response = await client.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async(productData) => {
    const response = await client.post("/products", productData);
    return response.data;
};

export const updateProduct = async(id, productData) => {
    const response = await client.put(`/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async(id) => {
    const response = await client.delete(`/products/${id}`);
    return response.data;
};

export default client;

export const getRelatedProducts = async (id) => {
    const response = await client.get(`/products/${id}/related`);
    return response.data;
};
