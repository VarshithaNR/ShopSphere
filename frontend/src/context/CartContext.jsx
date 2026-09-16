import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const readStoredCart = () => {
    try {
        const raw = localStorage.getItem("cart");
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const persist = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
};

export function CartProvider({ children }) {
    const [cart, setCart] = useState(readStoredCart);

    useEffect(() => {
        const syncFromStorage = () => setCart(readStoredCart());
        window.addEventListener("cartUpdated", syncFromStorage);
        window.addEventListener("storage", syncFromStorage);
        return () => {
            window.removeEventListener("cartUpdated", syncFromStorage);
            window.removeEventListener("storage", syncFromStorage);
        };
    }, []);

    // Returns { ok: boolean, message?: string } instead of throwing/alerting,
    // so the calling component decides how to surface it (toast, inline, etc).
    const addToCart = useCallback((product, quantity) => {
        let result = { ok: true };

        setCart((currentCart) => {
            const existing = currentCart.find((item) => item._id === product._id);
            const requestedTotal = (existing?.quantity || 0) + quantity;

            if (requestedTotal > product.stock) {
                result = {
                    ok: false,
                    message: `Only ${product.stock} item(s) available in stock.`,
                };
                return currentCart;
            }

            const updated = existing
                ? currentCart.map((item) =>
                    item._id === product._id ? { ...item, quantity: requestedTotal } : item
                )
                : [...currentCart, { ...product, quantity }];

            persist(updated);
            return updated;
        });

        return result;
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart((currentCart) => {
            const updated = currentCart.filter((item) => item._id !== productId);
            persist(updated);
            return updated;
        });
    }, []);

    const setQuantity = useCallback((productId, quantity) => {
        let result = { ok: true };

        setCart((currentCart) => {
            const item = currentCart.find((entry) => entry._id === productId);
            if (!item) return currentCart;

            if (quantity < 1) {
                const updated = currentCart.filter((entry) => entry._id !== productId);
                persist(updated);
                return updated;
            }

            if (quantity > item.stock) {
                result = { ok: false, message: `Only ${item.stock} item(s) available in stock.` };
                return currentCart;
            }

            const updated = currentCart.map((entry) =>
                entry._id === productId ? { ...entry, quantity } : entry
            );
            persist(updated);
            return updated;
        });

        return result;
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        persist([]);
    }, []);

    const itemCount = useMemo(
        () => cart.reduce((total, item) => total + item.quantity, 0),
        [cart]
    );

    const subtotal = useMemo(
        () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
        [cart]
    );

    const value = { cart, addToCart, removeFromCart, setQuantity, clearCart, itemCount, subtotal };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
