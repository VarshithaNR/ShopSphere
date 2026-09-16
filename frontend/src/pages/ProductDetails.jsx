import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { getProductReviews, createReview } from "../api/reviewApi";
import { getErrorMessage } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import StarRating from "../components/StarRating";
import QuantitySelector from "../components/QuantitySelector";
import Spinner from "../components/Spinner";
import StateMessage from "../components/StateMessage";

function ReviewForm({ productId, onSubmitted }) {
    const toast = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError("Please write a short review before submitting.");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const data = await createReview({ productId, rating, comment: comment.trim() });
            toast.success("Review submitted — thanks for the feedback!");
            setComment("");
            setRating(5);
            onSubmitted(data.review);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to submit review."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card card--padded" style={{ marginBottom: 20 }}>
            <h4>Write a review</h4>
            <div className="field">
                <label htmlFor="review-rating">Your rating</label>
                <select
                    id="review-rating"
                    className="select"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{ maxWidth: 160 }}
                >
                    {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>
                    ))}
                </select>
            </div>
            <div className="field">
                <label htmlFor="review-comment">Your review</label>
                <textarea
                    id="review-comment"
                    className={`textarea${error ? " has-error" : ""}`}
                    placeholder="What did you think of this product?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                />
                {error && <p className="field-error">{error}</p>}
            </div>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
            </button>
        </form>
    );
}

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated, user } = useAuth();
    const toast = useToast();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);

        getProductById(id)
            .then((data) => {
                if (cancelled) return;
                setProduct(data.product);
                setQuantity(1);
            })
            .catch((err) => {
                if (cancelled) return;
                if (err.response?.status === 404 || err.response?.status === 400) {
                    setNotFound(true);
                } else {
                    toast.error(getErrorMessage(err, "Failed to load product."));
                }
            })
            .finally(() => !cancelled && setLoading(false));

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        setReviewsLoading(true);
        getProductReviews(id)
            .then((data) => !cancelled && setReviews(data.reviews || []))
            .catch(() => {})
            .finally(() => !cancelled && setReviewsLoading(false));
        return () => { cancelled = true; };
    }, [id]);

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) return;
        const result = addToCart(product, quantity);
        if (!result.ok) {
            toast.error(result.message);
            return;
        }
        toast.success(`Added ${quantity} × ${product.name} to cart`);
    };

    const handleBuyNow = () => {
        if (!product || product.stock <= 0) return;
        const result = addToCart(product, quantity);
        if (!result.ok) {
            toast.error(result.message);
            return;
        }
        navigate("/cart");
    };

    const alreadyReviewed = isAuthenticated && reviews.some((r) => r.user?._id === user?.id);

    if (loading) {
        return <Spinner fullPage label="Loading product..." />;
    }

    if (notFound || !product) {
        return (
            <div className="page page--narrow">
                <StateMessage
                    icon="❓"
                    title="Product not found"
                    message="This product may have been removed or the link is incorrect."
                    action={<Link to="/products" className="btn btn--primary">Back to Products</Link>}
                />
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;

    return (
        <div className="page page--medium">
            <Link to="/products" className="btn btn--ghost btn--sm" style={{ marginBottom: 16 }}>
                ← Back to Products
            </Link>

            <div className="row" style={{ alignItems: "flex-start", gap: 32 }}>
                <div className="card" style={{ flex: "1 1 360px", maxWidth: 420 }}>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "var(--radius-md)" }}
                    />
                </div>

                <div style={{ flex: "1 1 320px" }}>
                    <p className="text-muted text-sm" style={{ textTransform: "uppercase" }}>{product.brand}</p>
                    <h1>{product.name}</h1>
                    <StarRating rating={product.rating || 0} count={reviews.length} />

                    <p className="text-muted" style={{ marginTop: 12 }}>{product.description}</p>

                    <div style={{ fontSize: 32, fontWeight: 800, margin: "16px 0" }}>
                        ₹{product.price.toLocaleString("en-IN")}
                    </div>

                    <p style={{ marginBottom: 16 }}>
                        {isOutOfStock ? (
                            <span className="badge badge--danger">Out of Stock</span>
                        ) : product.stock <= 5 ? (
                            <span className="badge badge--warning">Only {product.stock} left in stock</span>
                        ) : (
                            <span className="badge badge--success">In Stock</span>
                        )}
                    </p>

                    {!isOutOfStock && (
                        <div className="field">
                            <label>Quantity</label>
                            <QuantitySelector quantity={quantity} max={product.stock} onChange={setQuantity} />
                        </div>
                    )}

                    <div className="row" style={{ marginTop: 20 }}>
                        <button
                            className="btn btn--accent"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                        >
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                        {!isOutOfStock && (
                            <button className="btn btn--primary" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <hr className="divider" />

            <section>
                <h2>Customer Reviews</h2>
                <StarRating rating={product.rating || 0} count={reviews.length} />

                <div style={{ marginTop: 20 }}>
                    {isAuthenticated && !alreadyReviewed && (
                        <ReviewForm productId={product._id} onSubmitted={(review) => setReviews((r) => [review, ...r])} />
                    )}
                    {isAuthenticated && alreadyReviewed && (
                        <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                            You've already reviewed this product.
                        </p>
                    )}
                    {!isAuthenticated && (
                        <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                            <Link to="/login">Log in</Link> to write a review.
                        </p>
                    )}

                    {reviewsLoading ? (
                        <Spinner label="Loading reviews..." />
                    ) : reviews.length === 0 ? (
                        <p className="text-muted">No reviews yet — be the first to review this product.</p>
                    ) : (
                        <div className="card card--padded">
                            {reviews.map((review) => (
                                <div key={review._id} className="review">
                                    <div className="review__header">
                                        <span className="review__author">{review.user?.name || "Anonymous"}</span>
                                        <span className="review__date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <StarRating rating={review.rating} size="small" />
                                    <p style={{ marginTop: 6 }}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ProductDetails;
