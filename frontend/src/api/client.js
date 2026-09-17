import axios from "axios";

// Falls back to localhost:5000 only so local dev works without extra setup;
// production deployments must set VITE_API_URL (see .env.example).
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL });

// Attach the auth token to every request automatically instead of every
// call site having to remember `headers: { Authorization: ... }`.
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the token is invalid/expired, the backend returns 401. Clear the stale
// session and let the app redirect to login instead of showing broken UI.
// Only fire the "session expired" signal if there was actually a token to
// begin with — a 401 on a fresh login attempt just means wrong credentials,
// not an expired session.
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const hadToken = Boolean(localStorage.getItem("token"));
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("authUpdated"));
            if (hadToken) {
                window.dispatchEvent(new Event("sessionExpired"));
            }
        }
        return Promise.reject(error);
    }
);

// Small helper so components can show a consistent message regardless of
// whether the error came from the server, a network failure, or something else.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.request && !error.response) return "Can't reach the server. Check your connection and try again.";
    return fallback;
};

export default client;
