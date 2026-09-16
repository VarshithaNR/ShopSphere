import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMyOrderById, getOrderByIdAdmin } from "../api/orderApi";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import StateMessage from "../components/StateMessage";
import OrderStatusBadge from "../components/OrderStatusBadge";

const STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

function OrderTracker({ status }) {
    if (status === "Cancelled") {
        return (
            <div className="tracker">
                <div className="tracker__step" style={{ color: "var(--color-danger)", borderColor: "#f6c9c9", background: "var(--color-danger-bg)", flex: "none", minWidth: "100%" }}>
                    This order was cancelled
                </div>
            </div>
        );
    }

    const currentIndex = STEPS.indexOf(status);

    return (
        <div className="tracker">
            {STEPS.map((step, index) => {
                let className = "tracker__step";
                if (index < currentIndex) className += " tracker__step--done";
                else if (index === currentIndex) className += " tracker__step--current";
                return <div key={step} className={className}>{step}</div>;
            })}
        </div>
    );
}

function OrderDetails() {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrder = async () => {
            setLoading(true);
            setError("");
            try {
                // Admins can look up any order; customers only their own —
                // the backend enforces this too, this just picks the right endpoint.
                const data = isAdmin ? await getOrderByIdAdmin(id) : await getMyOrderById(id);
                if (!cancelled) setOrder(data.order);
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err, "Failed to load this order."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchOrder();
        return () => { cancelled = true; };
    }, [id, isAdmin]);

    if (loading) return <Spinner fullPage label="Loading order..." />;

    if (error) {
        return (
            <div className="page page--medium">
                <StateMessage
                    icon="⚠️"
                    title="Couldn't load this order"
                    message={error}
                    action={
                        <Link to={isAdmin ? "/admin/orders" : "/orders"} className="btn btn--primary">
                            Back to Orders
                        </Link>
                    }
                />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="page page--medium">
            <Link to={isAdmin ? "/admin/orders" : "/orders"} className="text-sm">
                ← Back to {isAdmin ? "Orders" : "My Orders"}
            </Link>

            <div className="row row--between" style={{ marginTop: 12, marginBottom: 4 }}>
                <h1 style={{ marginBottom: 0 }}>Order #{order._id.slice(-8).toUpperCase()}</h1>
                <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-muted text-sm">Placed on {formatDate(order.createdAt)}</p>

            <div className="card card--padded" style={{ margin: "20px 0" }}>
                <h3 style={{ marginTop: 0 }}>Order Status</h3>
                <OrderTracker status={order.status} />
            </div>

            <h2>Items</h2>
            <div className="card card--padded" style={{ marginBottom: 20 }}>
                {order.items.map((item) => (
                    <div key={item.product?._id || item._id} className="line-item">
                        {item.product?.image && (
                            <img src={item.product.image} alt={item.name} className="line-item__image" />
                        )}
                        <div className="line-item__details">
                            <div className="row row--between">
                                <div>
                                    <div className="line-item__name">
                                        {item.product?._id ? (
                                            <Link to={`/products/${item.product._id}`}>{item.name}</Link>
                                        ) : item.name}
                                    </div>
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
                    <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card card--padded">
                    <h3 style={{ marginTop: 0 }}>Shipping Information</h3>
                    <p style={{ margin: "4px 0" }}>{order.customer.fullName}</p>
                    <p style={{ margin: "4px 0" }} className="text-muted">{order.customer.address}</p>
                    <p style={{ margin: "4px 0" }} className="text-muted">{order.customer.phone}</p>
                    <p style={{ margin: "4px 0" }} className="text-muted">{order.customer.email}</p>
                </div>

                <div className="card card--padded">
                    <h3 style={{ marginTop: 0 }}>Payment</h3>
                    <p style={{ margin: "4px 0" }}>{order.paymentMethod}</p>
                    <p className="text-muted text-sm" style={{ margin: "4px 0" }}>
                        {order.paymentMethod === "Cash on Delivery" ?
                            "Pay when your order arrives." :
                            "Demo checkout — no live payment gateway is connected."}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;
