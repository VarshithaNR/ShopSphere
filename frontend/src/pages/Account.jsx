import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateProfile, changePassword } from "../api/authApi";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProfileSection() {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [name, setName] = useState(user.name);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }
        setError("");
        setSaving(true);
        try {
            const data = await updateProfile({ name: name.trim() });
            updateUser({ name: data.user.name });
            toast.success("Profile updated.");
        } catch (err) {
            setError(getErrorMessage(err, "Failed to update profile."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h3 style={{ marginTop: 0 }}>Account Information</h3>

            <div className="field">
                <label htmlFor="account-name">Name</label>
                <input
                    id="account-name"
                    className={`input${error ? " has-error" : ""}`}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                />
                {error && <p className="field-error">{error}</p>}
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="account-email">Email</label>
                <input id="account-email" className="input" value={user.email} disabled readOnly />
                <p className="field-hint">Email can't be changed here.</p>
            </div>

            <button type="submit" className="btn btn--primary" disabled={saving} style={{ marginTop: 20 }}>
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}

function ChangePasswordSection() {
    const toast = useToast();
    const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((current) => ({ ...current, [e.target.name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!formData.currentPassword) next.currentPassword = "Current password is required.";
        if (formData.newPassword.length < 6) next.newPassword = "New password must be at least 6 characters.";
        if (formData.newPassword !== formData.confirmPassword) next.confirmPassword = "Passwords do not match.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await changePassword(formData);
            toast.success("Password changed successfully.");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to change password."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="form-card" onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
            <h3 style={{ marginTop: 0 }}>Change Password</h3>

            <div className="field">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    className={`input${errors.currentPassword ? " has-error" : ""}`}
                    value={formData.currentPassword}
                    onChange={handleChange}
                />
                {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
            </div>

            <div className="field">
                <label htmlFor="newPassword">New Password</label>
                <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    className={`input${errors.newPassword ? " has-error" : ""}`}
                    value={formData.newPassword}
                    onChange={handleChange}
                />
                {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    className={`input${errors.confirmPassword ? " has-error" : ""}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn--primary" disabled={saving} style={{ marginTop: 20 }}>
                {saving ? "Updating..." : "Change Password"}
            </button>
        </form>
    );
}

function Account() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogout = () => {
        logout();
        toast.info("You've been logged out.");
        navigate("/login");
    };

    if (!user) return null;

    return (
        <div className="page page--narrow">
            <h1>My Account</h1>

            <div className="row" style={{ gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <Link to="/orders" className="btn btn--outline btn--sm">My Orders</Link>
                <Link to="/wishlist" className="btn btn--outline btn--sm">Wishlist</Link>
                <button className="btn btn--outline btn--sm" onClick={handleLogout}>Logout</button>
            </div>

            <ProfileSection />
            <ChangePasswordSection />
        </div>
    );
}

export default Account;
