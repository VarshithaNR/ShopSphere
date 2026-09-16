const STATUS_STYLES = {
    Pending: "badge--warning",
    Confirmed: "badge--info",
    Shipped: "badge--info",
    Delivered: "badge--success",
    Cancelled: "badge--danger",
};

function OrderStatusBadge({ status }) {
    return <span className={`badge ${STATUS_STYLES[status] || "badge--neutral"}`}>{status}</span>;
}

export default OrderStatusBadge;
