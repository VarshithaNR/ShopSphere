import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((current) => ({ ...current, [e.target.name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!formData.name.trim()) next.name = "Name is required.";
        if (!EMAIL_PATTERN.test(formData.email.trim())) next.email = "Enter a valid email address.";
        if (formData.password.length < 6) next.password = "Password must be at least 6 characters.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const data = await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (data.success) {
                // Register already returns a token, so log the user straight in
                // instead of making them log in again right after signing up.
                login(data.token, data.user);
                toast.success("Account created! Welcome to ShopSphere.");
                navigate("/", { replace: true });
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Registration failed. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page--narrow">
            <h1>Create Account</h1>

            <form className="form-card" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        className={`input${errors.name ? " has-error" : ""}`}
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        className={`input${errors.email ? " has-error" : ""}`}
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="field-error">{errors.email}</p>}
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        className={`input${errors.password ? " has-error" : ""}`}
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password ?
                        <p className="field-error">{errors.password}</p> :
                        <p className="field-hint">Must be at least 6 characters.</p>
                    }
                </div>

                <button type="submit" className="btn btn--primary btn--block" disabled={loading} style={{ marginTop: 20 }}>
                    {loading ? "Creating Account..." : "Register"}
                </button>
            </form>

            <p className="text-muted text-sm" style={{ marginTop: 16 }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

export default Register;
