import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import QuantitySelector from "../components/QuantitySelector";
import StateMessage from "../components/StateMessage";

function Cart() {
    const { cart, removeFromCart, setQuantity, subtotal } = useCart();
    const toast = useToast();
    const navigate = useNavigate();

    const handleQuantityChange = (productId, quantity) => {
        const result = setQuantity(productId, quantity);
        if (!result.ok) toast.error(result.message);
    };

    if (cart.length === 0) {
        return (
            <div className="page page--narrow">
                <h1>Shopping Cart</h1>
                <StateMessage
                    icon="🛒"
                    title="Your cart is empty"
                    message="Browse our products and add something you like."
                    action={<Link to="/products" className="btn btn--primary">Start Shopping</Link>}
                />
            </div>
        );
    }

    return (
        <div className="page page--medium">
            <h1>Shopping Cart</h1>

            <div className="card card--padded">
                {cart.map((item) => (
                    <div key={item._id} className="line-item">
                        <img src={item.image} alt={item.name} className="line-item__image" />
                        <div className="line-item__details">
                            <div className="row row--between">
                                <div>
                                    <div className="line-item__name">
                                        <Link to={`/products/${item._id}`}>{item.name}</Link>
                                    </div>
                                    <span className="text-muted text-sm">₹{item.price.toLocaleString("en-IN")} each</span>
                                </div>
                                <strong>₹{(item.price * item.quantity).toLocaleString("en-IN")}</strong>
                            </div>

                            <div className="line-item__meta">
                                <QuantitySelector
                                    quantity={item.quantity}
                                    max={item.stock}
                                    onChange={(q) => handleQuantityChange(item._id, q)}
                                />
                                <span className="text-muted text-sm">
                                    {item.stock <= 5 ? `Only ${item.stock} left` : "In stock"}
                                </span>
                                <button
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => removeFromCart(item._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card card--padded" style={{ marginTop: 20, maxWidth: 360, marginLeft: "auto" }}>
                <div className="summary-row summary-row--total">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
            </div>

            <div className="row row--between" style={{ marginTop: 20 }}>
                <Link to="/products" className="btn btn--outline">Continue Shopping</Link>
                <button className="btn btn--accent" onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}

export default Cart;
