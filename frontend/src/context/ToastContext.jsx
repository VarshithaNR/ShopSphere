import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const removeToast = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }, []);

    const showToast = useCallback((message, type = "info", duration = 4000) => {
        const id = ++idCounter;
        setToasts((current) => [...current, { id, message, type }]);
        timers.current[id] = setTimeout(() => removeToast(id), duration);
        return id;
    }, [removeToast]);

    const toast = {
        success: (message, duration) => showToast(message, "success", duration),
        error: (message, duration) => showToast(message, "error", duration),
        info: (message, duration) => showToast(message, "info", duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast--${t.type}`} role="status">
                        <span>{t.message}</span>
                        <button
                            className="toast__close"
                            onClick={() => removeToast(t.id)}
                            aria-label="Dismiss notification"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
