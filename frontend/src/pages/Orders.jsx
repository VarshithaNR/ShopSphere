import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";
import { getErrorMessage } from "../api/client";
import Spinner from "../components/Spinner";
import StateMessage from "../components/StateMessage";
import OrderStatusBadge from "../components/OrderStatusBadge";

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchOrders = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getMyOrders();
                if (!cancelled) setOrders(data.orders);
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err, "Failed to load your orders."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchOrders();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="page page--medium">
            <h1>My Orders</h1>

            {loading && <Spinner fullPage label="Loading your orders..." />}

            {!loading && error && (
                <StateMessage icon="⚠️" title="Couldn't load your orders" message={error} />
            )}

            {!loading && !error && orders.length === 0 && (
                <StateMessage
                    icon="📦"
                    title="No orders yet"
                    message="When you place an order, it'll show up here."
                    action={<Link to="/products" className="btn btn--primary">Start Shopping</Link>}
                />
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="stack">
                    {orders.map((order) => (
                        <Link key={order._id} to={`/orders/${order._id}`} className="card card--padded order-card">
                            <div className="row row--between">
                                <div>
                                    <div className="line-item__name">Order #{order._id.slice(-8).toUpperCase()}</div>
                                    <span className="text-muted text-sm">{formatDate(order.createdAt)}</span>
                                </div>
                                <OrderStatusBadge status={order.status} />
                            </div>

                            <div className="row row--between" style={{ marginTop: 12 }}>
                                <span className="text-muted text-sm">
                                    {order.items.length} item{order.items.length === 1 ? "" : "s"} · {order.paymentMethod}
                                </span>
                                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
