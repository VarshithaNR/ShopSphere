import client from "./client";

export const registerUser = async({ name, email, password }) => {
    const response = await client.post("/auth/register", { name, email, password });
    return response.data;
};

export const loginUser = async({ email, password }) => {
    const response = await client.post("/auth/login", { email, password });
    return response.data;
};
