import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

export const getProducts = async() => {
    const response = await API.get("/products");
    return response.data;
};

export default API;