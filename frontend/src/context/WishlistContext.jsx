import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getWishlist, addToWishlist as addToWishlistApi, removeFromWishlist as removeFromWishlistApi } from "../api/wishlistApi";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // The wishlist is server-side and per-user (never stored in localStorage),
    // so it's fetched fresh whenever the logged-in user changes, and cleared
    // immediately on logout so the next visitor never sees a stale list.
    useEffect(() => {
        if (!isAuthenticated) {
            setWishlist([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        getWishlist()
            .then((data) => !cancelled && setWishlist(data.wishlist || []))
            .catch(() => {})
            .finally(() => !cancelled && setLoading(false));

        return () => { cancelled = true; };
    }, [isAuthenticated]);

    const isInWishlist = useCallback(
        (productId) => wishlist.some((item) => item._id === productId),
        [wishlist]
    );

    // Returns { ok, message } like CartContext's actions, so callers can
    // show a toast without this context knowing about toasts itself.
    const addToWishlist = useCallback(async (product) => {
        if (!isAuthenticated) {
            return { ok: false, message: "Log in to save items to your wishlist." };
        }
        try {
            const data = await addToWishlistApi(product._id);
            setWishlist(data.wishlist || []);
            return { ok: true };
        } catch (error) {
            return { ok: false, message: error.response?.data?.message || "Failed to add to wishlist." };
        }
    }, [isAuthenticated]);

    const removeFromWishlist = useCallback(async (productId) => {
        try {
            const data = await removeFromWishlistApi(productId);
            setWishlist(data.wishlist || []);
            return { ok: true };
        } catch (error) {
            return { ok: false, message: error.response?.data?.message || "Failed to remove from wishlist." };
        }
    }, []);

    const toggleWishlist = useCallback(async (product) => {
        return isInWishlist(product._id) ? removeFromWishlist(product._id) : addToWishlist(product);
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    const count = useMemo(() => wishlist.length, [wishlist]);

    const value = { wishlist, loading, count, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
