import { useNavigate, useLocation, Link } from "react-router-dom";

function OrderSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    return (
        <div className="page page--narrow" style={{ textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
            <div style={{ fontSize: 56 }} aria-hidden="true">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p className="text-muted">Thank you for shopping with ShopSphere.</p>

            {orderId && (
                <p className="text-muted text-sm">
                    Order reference: <strong>#{orderId.slice(-8).toUpperCase()}</strong>
                </p>
            )}

            <div className="row" style={{ justifyContent: "center", gap: 12, marginTop: 24 }}>
                {orderId && (
                    <button className="btn btn--primary" onClick={() => navigate(`/orders/${orderId}`)}>
                        View Order
                    </button>
                )}
                <Link to="/products" className="btn btn--outline">Continue Shopping</Link>
            </div>
        </div>
    );
}

export default OrderSuccess;
