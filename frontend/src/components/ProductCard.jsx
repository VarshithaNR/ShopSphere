import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const toast = useToast();

    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= 5;
    const inWishlist = isAuthenticated && isInWishlist(product._id);

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (isOutOfStock) return;
        const result = addToCart(product, 1);
        if (!result.ok) {
            toast.error(result.message);
            return;
        }
        toast.success(`Added ${product.name} to cart`);
    };

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        const result = await toggleWishlist(product);
        if (!result.ok) {
            toast.error(result.message);
        }
    };

    const detailsUrl = `/products/${product._id}`;

    return (
        <div className="card product-card">
            <div className="product-card__image-wrap">
                <Link to={detailsUrl} className="product-card__image-link" tabIndex={-1} aria-hidden="true">
                    <img
                        src={product.image}
                        alt=""
                        className="product-card__image"
                        loading="lazy"
                    />
                </Link>

                {isOutOfStock && (
                    <span className="badge badge--danger" style={{ position: "absolute", top: 8, left: 8 }}>
                        Out of stock
                    </span>
                )}
                {isLowStock && (
                    <span className="badge badge--warning" style={{ position: "absolute", top: 8, left: 8 }}>
                        Only {product.stock} left
                    </span>
                )}

                <button
                    type="button"
                    className={`product-card__wishlist-btn${inWishlist ? " product-card__wishlist-btn--active" : ""}`}
                    onClick={handleWishlistClick}
                    aria-pressed={inWishlist}
                    aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                >
                    {inWishlist ? "♥" : "♡"}
                </button>
            </div>

            <Link to={detailsUrl} className="product-card__body-link">
                <div className="product-card__body">
                    <span className="product-card__brand">{product.brand}</span>
                    <h3 className="product-card__name">{product.name}</h3>
                    <div className="product-card__rating-row">
                        <StarRating rating={product.rating || 0} size="small" />
                        {product.numReviews > 0 && (
                            <span className="product-card__review-count">({product.numReviews})</span>
                        )}
                    </div>
                    <div className="product-card__price">₹{product.price.toLocaleString("en-IN")}</div>
                </div>
            </Link>

            <div className="product-card__footer">
                <button
                    type="button"
                    className="btn btn--primary btn--sm btn--block"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
                <Link to={detailsUrl} className="btn btn--outline btn--sm">
                    View
                </Link>
            </div>
        </div>
    );
}

export default ProductCard;
