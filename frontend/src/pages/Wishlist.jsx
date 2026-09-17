import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Spinner from "../components/Spinner";
import StateMessage from "../components/StateMessage";
import StarRating from "../components/StarRating";

function Wishlist() {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const toast = useToast();

    const handleMoveToCart = (product) => {
        if (product.stock <= 0) {
            toast.error("This item is currently out of stock.");
            return;
        }
        const result = addToCart(product, 1);
        if (!result.ok) {
            toast.error(result.message);
            return;
        }
        removeFromWishlist(product._id);
        toast.success(`Moved ${product.name} to your cart`);
    };

    const handleRemove = async (product) => {
        const result = await removeFromWishlist(product._id);
        if (!result.ok) toast.error(result.message);
    };

    if (loading) return <Spinner fullPage label="Loading your wishlist..." />;

    if (wishlist.length === 0) {
        return (
            <div className="page page--narrow">
                <h1>My Wishlist</h1>
                <StateMessage
                    icon="♡"
                    title="Your wishlist is empty"
                    message="Save products you're interested in and find them here later."
                    action={<Link to="/products" className="btn btn--primary">Browse Products</Link>}
                />
            </div>
        );
    }

    return (
        <div className="page page--medium">
            <h1>My Wishlist</h1>

            <div className="card card--padded">
                {wishlist.map((product) => (
                    <div key={product._id} className="line-item">
                        <img src={product.image} alt={product.name} className="line-item__image" />
                        <div className="line-item__details">
                            <div className="row row--between">
                                <div>
                                    <div className="line-item__name">
                                        <Link to={`/products/${product._id}`}>{product.name}</Link>
                                    </div>
                                    <StarRating rating={product.rating || 0} size="small" />
                                    <div className="text-muted text-sm">₹{product.price.toLocaleString("en-IN")}</div>
                                </div>
                            </div>

                            <div className="line-item__meta">
                                {product.stock > 0 ? (
                                    <button className="btn btn--primary btn--sm" onClick={() => handleMoveToCart(product)}>
                                        Move to Cart
                                    </button>
                                ) : (
                                    <span className="badge badge--danger">Out of stock</span>
                                )}
                                <button className="btn btn--ghost btn--sm" onClick={() => handleRemove(product)}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Wishlist;
