import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        // Corrupted localStorage value — treat as logged out rather than crash.
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readStoredUser);

    useEffect(() => {
        // The API client dispatches this on a 401 (expired/invalid token),
        // and we dispatch it ourselves on login/logout below — this keeps
        // every consumer of useAuth() in sync without prop drilling.
        const syncFromStorage = () => setUser(readStoredUser());

        window.addEventListener("authUpdated", syncFromStorage);
        window.addEventListener("storage", syncFromStorage);

        return () => {
            window.removeEventListener("authUpdated", syncFromStorage);
            window.removeEventListener("storage", syncFromStorage);
        };
    }, []);

    const login = useCallback((token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        window.dispatchEvent(new Event("authUpdated"));
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.dispatchEvent(new Event("authUpdated"));
    }, []);

    const value = {
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
