import { useEffect } from "react";
import { useToast } from "../context/ToastContext";

// Renders nothing — just listens for the "sessionExpired" event dispatched
// by api/client.js (on a 401 for a previously-logged-in user) and surfaces
// it as a toast. AuthContext already handles clearing the session and
// ProtectedRoute already handles the redirect; this only adds the message.
function SessionWatcher() {
    const toast = useToast();

    useEffect(() => {
        const handleSessionExpired = () => {
            toast.info("Your session has expired. Please log in again.");
        };

        window.addEventListener("sessionExpired", handleSessionExpired);
        return () => window.removeEventListener("sessionExpired", handleSessionExpired);
    }, [toast]);

    return null;
}

export default SessionWatcher;
