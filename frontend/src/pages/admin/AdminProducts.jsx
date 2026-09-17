import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/productApi";
import { getErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";
import StateMessage from "../../components/StateMessage";

const STOCK_FILTERS = [
    { value: "", label: "All Stock Levels" },
    { value: "in", label: "In Stock" },
    { value: "low", label: "Low Stock (≤5)" },
    { value: "out", label: "Out of Stock" },
];

function AdminProducts() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getProducts({
                search: search || undefined,
                category: categoryFilter || undefined,
            });
            setProducts(data.products);
            // Build the category dropdown from an unfiltered fetch's worth of
            // names the first time through, so options don't shrink as the
            // admin filters.
            setCategories((current) => {
                if (current.length > 0) return current;
                return [...new Set(data.products.map((p) => p.category))].sort();
            });
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load products."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchProducts, search ? 350 : 0);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryFilter]);

    const visibleProducts = useMemo(() => {
        if (!stockFilter) return products;
        return products.filter((product) => {
            if (stockFilter === "out") return product.stock === 0;
            if (stockFilter === "low") return product.stock > 0 && product.stock <= 5;
            if (stockFilter === "in") return product.stock > 5;
            return true;
        });
    }, [products, stockFilter]);

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Delete "${productName}"? This can't be undone.`)) return;

        setDeletingId(productId);
        try {
            await deleteProduct(productId);
            setProducts((current) => current.filter((product) => product._id !== productId));
            toast.success("Product deleted successfully.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete product."));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="row row--between" style={{ marginBottom: 20 }}>
                <h1 style={{ marginBottom: 0 }}>Products</h1>
                <Link to="/admin/products/add" className="btn btn--primary">+ Add Product</Link>
            </div>

            <div className="filter-bar">
                <input
                    type="search"
                    className="input filter-bar__search"
                    placeholder="Search products by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search products"
                />
                <select
                    className="input select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <select
                    className="input select"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    aria-label="Filter by stock level"
                >
                    {STOCK_FILTERS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            {!loading && !error && (
                <p className="text-muted text-sm" style={{ marginBottom: 12 }}>
                    {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"} found
                </p>
            )}

            {loading && <Spinner fullPage label="Loading products..." />}

            {!loading && error && <StateMessage icon="⚠️" title="Couldn't load products" message={error} />}

            {!loading && !error && visibleProducts.length === 0 && (
                <StateMessage icon="📦" title="No products found" message="Try a different search or filter, or add your first product." />
            )}

            {!loading && !error && visibleProducts.length > 0 && (
                <div className="card table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleProducts.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="row" style={{ gap: 10 }}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                <div className="text-muted text-sm">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>₹{product.price.toLocaleString("en-IN")}</td>
                                    <td>
                                        {product.stock === 0 ? (
                                            <span className="badge badge--danger">Out of stock</span>
                                        ) : product.stock <= 5 ? (
                                            <span className="badge badge--warning">{product.stock} left</span>
                                        ) : (
                                            product.stock
                                        )}
                                    </td>
                                    <td>{product.rating > 0 ? `⭐ ${product.rating.toFixed(1)}` : "—"}</td>
                                    <td>
                                        <div className="row" style={{ gap: 8 }}>
                                            <Link to={`/admin/products/edit/${product._id}`} className="btn btn--outline btn--sm">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn--danger btn--sm"
                                                onClick={() => handleDelete(product._id, product.name)}
                                                disabled={deletingId === product._id}
                                            >
                                                {deletingId === product._id ? "Deleting..." : "Delete"}
                                            </button>
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

export default AdminProducts;
