import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/adminApi";
import { getErrorMessage } from "../../api/client";
import Spinner from "../../components/Spinner";
import StateMessage from "../../components/StateMessage";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const formatDate = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchStats = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getDashboardStats();
                if (cancelled) return;
                setStats(data.stats);
                setRecentOrders(data.recentOrders || []);
                setLowStockProducts(data.lowStockProductList || []);
                setRecentProducts(data.recentProducts || []);
            } catch (err) {
                if (!cancelled) setError(getErrorMessage(err, "Failed to load dashboard statistics."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchStats();
        return () => { cancelled = true; };
    }, []);

    if (loading) return <Spinner fullPage label="Loading dashboard..." />;

    if (error) {
        return <StateMessage icon="⚠️" title="Couldn't load the dashboard" message={error} />;
    }

    const cards = [
        { label: "Total Products", value: stats.totalProducts },
        { label: "Total Orders", value: stats.totalOrders },
        { label: "Total Customers", value: stats.totalCustomers },
        { label: "Total Sales", value: `₹${stats.totalSales.toLocaleString("en-IN")}` },
        { label: "Pending Orders", value: stats.pendingOrders },
        { label: "Delivered Orders", value: stats.deliveredOrders },
        { label: "Low Stock Products", value: stats.lowStockProducts },
        { label: "Out of Stock", value: stats.outOfStockProducts },
    ];

    return (
        <div>
            <h1>Dashboard</h1>

            <div className="stat-grid">
                {cards.map((card) => (
                    <div key={card.label} className="card stat-card">
                        <div className="stat-card__label">{card.label}</div>
                        <div className="stat-card__value">{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="row row--between" style={{ marginBottom: 12 }}>
                <h2 style={{ marginBottom: 0 }}>Recent Orders</h2>
                <Link to="/admin/orders" className="text-sm">View all orders →</Link>
            </div>

            {recentOrders.length === 0 ? (
                <StateMessage icon="🧾" title="No orders yet" message="Orders will show up here once customers start checking out." />
            ) : (
                <div className="card table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>
                                        <Link to={`/orders/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link>
                                    </td>
                                    <td>{order.customer?.fullName || order.user?.name || "—"}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>₹{order.totalAmount.toLocaleString("en-IN")}</td>
                                    <td><OrderStatusBadge status={order.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 32 }}>
                <div>
                    <h2>Low Stock Products</h2>
                    {lowStockProducts.length === 0 ? (
                        <p className="text-muted text-sm">No products are currently low on stock.</p>
                    ) : (
                        <div className="card table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Product</th><th>Stock</th></tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td><Link to={`/admin/products/edit/${product._id}`}>{product.name}</Link></td>
                                            <td><span className="badge badge--warning">{product.stock} left</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div>
                    <h2>Recently Added Products</h2>
                    {recentProducts.length === 0 ? (
                        <p className="text-muted text-sm">No products yet.</p>
                    ) : (
                        <div className="card table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Product</th><th>Price</th></tr>
                                </thead>
                                <tbody>
                                    {recentProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td><Link to={`/admin/products/edit/${product._id}`}>{product.name}</Link></td>
                                            <td>₹{product.price.toLocaleString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
