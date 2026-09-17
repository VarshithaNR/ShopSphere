import client from "./client";

export const registerUser = async({ name, email, password }) => {
    const response = await client.post("/auth/register", { name, email, password });
    return response.data;
};

export const loginUser = async({ email, password }) => {
    const response = await client.post("/auth/login", { email, password });
    return response.data;
};

export const getMe = async () => {
    const response = await client.get("/auth/me");
    return response.data;
};

export const updateProfile = async ({ name }) => {
    const response = await client.put("/auth/profile", { name });
    return response.data;
};

export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    const response = await client.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
    });
    return response.data;
};
