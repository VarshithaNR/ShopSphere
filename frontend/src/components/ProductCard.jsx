import { Link } from "react-router-dom";
import StarRating from "./StarRating";

function ProductCard({ product }) {
    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= 5;

    return (
        <Link to={`/products/${product._id}`} className="card product-card">
            <div className="product-card__image-wrap">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-card__image"
                    loading="lazy"
                />
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
            </div>

            <div className="product-card__body">
                <span className="product-card__brand">{product.brand}</span>
                <h3 className="product-card__name">{product.name}</h3>
                <StarRating rating={product.rating || 0} size="small" />
                <div className="product-card__price">₹{product.price.toLocaleString("en-IN")}</div>
            </div>

            <div className="product-card__footer">
                <span className={`btn btn--primary btn--sm btn--block${isOutOfStock ? " btn--outline" : ""}`}>
                    {isOutOfStock ? "View Details" : "View Product"}
                </span>
            </div>
        </Link>
    );
}

export default ProductCard;
