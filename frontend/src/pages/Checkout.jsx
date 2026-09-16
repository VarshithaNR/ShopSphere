import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderApi";
import { getErrorMessage } from "../api/client";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

const PAYMENT_METHODS = [
    { value: "Cash on Delivery", label: "Cash on Delivery", note: null },
    { value: "UPI", label: "UPI", note: "Demo checkout — no live payment gateway is connected." },
    { value: "Card", label: "Card", note: "Demo checkout — no live payment gateway is connected." },
];

function Checkout() {
    const navigate = useNavigate();
    const { cart, subtotal, clearCart } = useCart();
    const toast = useToast();

    const [formData, setFormData] = useState({ fullName: "", email: "", address: "", phone: "" });
    const [errors, setErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [submitting, setSubmitting] = useState(false);
    const submittedRef = useRef(false);

    useEffect(() => {
        if (cart.length === 0) navigate("/cart", { replace: true });
    }, [cart, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((current) => ({ ...current, [e.target.name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!formData.fullName.trim()) next.fullName = "Full name is required.";
        if (!EMAIL_PATTERN.test(formData.email.trim())) next.email = "Enter a valid email address.";
        if (!PHONE_PATTERN.test(formData.phone.trim())) next.phone = "Enter a valid phone number.";
        if (!formData.address.trim()) next.address = "Address is required.";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Belt-and-suspenders against double-submit: a ref (synchronous,
        // survives re-renders within the same click) plus the disabled state.
        if (submittedRef.current || submitting) return;
        if (!validate()) return;

        submittedRef.current = true;
        setSubmitting(true);

        try {
            const orderData = {
                customer: {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                },
                // Only product + quantity are sent — price and totalAmount are
                // always calculated server-side from the current DB prices.
                items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
                paymentMethod,
            };

            const data = await createOrder(orderData);

            if (data.success) {
                clearCart();
                navigate("/order-success", { state: { orderId: data.order._id } });
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to place order. Please try again."));
            submittedRef.current = false;
        } finally {
            setSubmitting(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <div className="page page--medium">
            <h1>Checkout</h1>

            <h2>Order Summary</h2>
            <div className="card card--padded" style={{ marginBottom: 24 }}>
                {cart.map((item) => (
                    <div key={item._id} className="line-item">
                        <img src={item.image} alt={item.name} className="line-item__image" style={{ width: 64, height: 64 }} />
                        <div className="line-item__details">
                            <div className="row row--between">
                                <div>
                                    <div className="line-item__name">{item.name}</div>
                                    <span className="text-muted text-sm">
                                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                                    </span>
                                </div>
                                <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="summary-row summary-row--total">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <h2>Shipping Information</h2>
                <div className="card card--padded" style={{ marginBottom: 24 }}>
                    <div className="field">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            className={`input${errors.fullName ? " has-error" : ""}`}
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className={`input${errors.email ? " has-error" : ""}`}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            className={`input${errors.phone ? " has-error" : ""}`}
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <p className="field-error">{errors.phone}</p>}
                    </div>

                    <div className="field" style={{ marginBottom: 0 }}>
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            name="address"
                            className={`textarea${errors.address ? " has-error" : ""}`}
                            placeholder="Enter your full shipping address"
                            rows="3"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="field-error">{errors.address}</p>}
                    </div>
                </div>

                <h2>Payment Method</h2>
                <div className="card card--padded" style={{ marginBottom: 24 }}>
                    {PAYMENT_METHODS.map((method) => (
                        <label key={method.value} className="radio-option">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value={method.value}
                                checked={paymentMethod === method.value}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <span>
                                {method.label}
                                {method.note && (
                                    <span className="text-faint text-sm" style={{ display: "block" }}>
                                        {method.note}
                                    </span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>

                <button type="submit" className="btn btn--accent btn--block" disabled={submitting}>
                    {submitting ? "Placing Order..." : `Place Order — ₹${subtotal.toLocaleString("en-IN")}`}
                </button>
            </form>
        </div>
    );
}

export default Checkout;
