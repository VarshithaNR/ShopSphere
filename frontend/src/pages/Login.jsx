import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const toast = useToast();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((current) => ({ ...current, [e.target.name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!EMAIL_PATTERN.test(formData.email.trim())) next.email = "Enter a valid email address.";
        if (!formData.password) next.password = "Password is required.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const data = await loginUser({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (data.success) {
                login(data.token, data.user);
                toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

                const redirectTo = location.state?.from || (data.user.role === "admin" ? "/admin/dashboard" : "/");
                navigate(redirectTo, { replace: true });
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Login failed. Please check your email and password."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page page--narrow">
            <h1>Login</h1>

            <form className="form-card" onSubmit={handleSubmit} noValidate>
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
                        autoComplete="current-password"
                        className={`input${errors.password ? " has-error" : ""}`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <p className="field-error">{errors.password}</p>}
                </div>

                <button type="submit" className="btn btn--primary btn--block" disabled={loading} style={{ marginTop: 20 }}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-muted text-sm" style={{ marginTop: 16 }}>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;
