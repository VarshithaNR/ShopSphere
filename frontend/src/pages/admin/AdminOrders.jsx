import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../../api/orderApi";
import { getErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";
import StateMessage from "../../components/StateMessage";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function AdminOrders() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllOrders({
                status: statusFilter || undefined,
                search: search || undefined,
            });
            setOrders(data.orders);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load orders."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchOrders, search ? 350 : 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, search]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const data = await updateOrderStatus(orderId, newStatus);
            setOrders((current) =>
                current.map((order) => (order._id === orderId ? { ...order, status: data.order.status } : order))
            );
            toast.success("Order status updated.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to update order status."));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div>
            <h1>Orders</h1>

            <div className="filter-bar">
                <input
                    type="search"
                    className="input filter-bar__search"
                    placeholder="Search by customer name, email or order ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search orders"
                />
                <select
                    className="input select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {loading && <Spinner fullPage label="Loading orders..." />}

            {!loading && error && <StateMessage icon="⚠️" title="Couldn't load orders" message={error} />}

            {!loading && !error && orders.length === 0 && (
                <StateMessage icon="🧾" title="No orders found" message="No orders match your current filters." />
            )}

            {!loading && !error && orders.length > 0 && (
                <div className="card table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>
                                        <Link to={`/orders/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link>
                                    </td>
                                    <td>
                                        <div>{order.customer?.fullName}</div>
                                        <div className="text-muted text-sm">{order.customer?.email}</div>
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{order.items.length}</td>
                                    <td>₹{order.totalAmount.toLocaleString("en-IN")}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        <div className="row" style={{ gap: 8, alignItems: "center" }}>
                                            <OrderStatusBadge status={order.status} />
                                            <select
                                                className="input select"
                                                style={{ minWidth: 130, padding: "6px 8px", fontSize: 13 }}
                                                value={order.status}
                                                disabled={updatingId === order._id}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                aria-label={`Update status for order ${order._id}`}
                                            >
                                                {STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
