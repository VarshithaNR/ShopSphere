import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/productApi";
import { getErrorMessage } from "../api/client";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import StateMessage from "../components/StateMessage";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 12;

function Products() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "All";
    const priceRange = searchParams.get("price") || "All";
    const sort = searchParams.get("sort") || "newest";
    const page = Number(searchParams.get("page")) || 1;

    const [searchInput, setSearchInput] = useState(search);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => setSearchInput(search), [search]);

    // Category list comes from a lightweight, unfiltered/unpaginated request
    // so the dropdown always shows every category even when a filter narrows
    // the visible results to zero.
    useEffect(() => {
        let cancelled = false;
        getProducts()
            .then((data) => {
                if (cancelled) return;
                const unique = [...new Set((data.products || []).map((p) => p.category))].sort();
                setCategories(unique);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const priceRangeToBounds = (value) => {
        if (value === "under1000") return { maxPrice: 999 };
        if (value === "1000to5000") return { minPrice: 1000, maxPrice: 5000 };
        if (value === "above5000") return { minPrice: 5001 };
        return {};
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        const params = {
            page,
            limit: PAGE_SIZE,
            sort: sort === "default" ? undefined : sort,
            search: search || undefined,
            category: category === "All" ? undefined : category,
            ...priceRangeToBounds(priceRange),
        };

        getProducts(params)
            .then((data) => {
                if (cancelled) return;
                setProducts(data.products || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total ?? (data.products || []).length);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(getErrorMessage(err, "Failed to load products."));
            })
            .finally(() => !cancelled && setLoading(false));

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category, priceRange, sort, page]);

    const updateParams = useCallback((updates) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === "All" || value === "default") {
                next.delete(key);
            } else {
                next.set(key, value);
            }
        });
        if (!("page" in updates)) next.delete("page");
        setSearchParams(next);
    }, [searchParams, setSearchParams]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        updateParams({ search: searchInput.trim() });
    };

    const hasActiveFilters = search || category !== "All" || priceRange !== "All" || sort !== "newest";

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams({});
    };

    const resultsLabel = useMemo(() => {
        if (loading) return "";
        return `${total} product${total === 1 ? "" : "s"} found`;
    }, [total, loading]);

    return (
        <div className="page">
            <div className="row row--between">
                <h1>ShopSphere Products</h1>
            </div>

            <form className="filter-bar" onSubmit={handleSearchSubmit}>
                <input
                    type="search"
                    className="input filter-bar__search"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="Search products"
                />
                <button type="submit" className="btn btn--outline">Search</button>

                <select
                    className="select"
                    value={category}
                    onChange={(e) => updateParams({ category: e.target.value })}
                    aria-label="Filter by category"
                >
                    <option value="All">All Categories</option>
                    {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>

                <select
                    className="select"
                    value={priceRange}
                    onChange={(e) => updateParams({ price: e.target.value })}
                    aria-label="Filter by price"
                >
                    <option value="All">All Prices</option>
                    <option value="under1000">Under ₹1,000</option>
                    <option value="1000to5000">₹1,000 – ₹5,000</option>
                    <option value="above5000">Above ₹5,000</option>
                </select>

                <select
                    className="select"
                    value={sort}
                    onChange={(e) => updateParams({ sort: e.target.value })}
                    aria-label="Sort products"
                >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Rating: High to Low</option>
                </select>

                {hasActiveFilters && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                        Clear filters
                    </button>
                )}
            </form>

            {!loading && !error && <p className="text-muted text-sm" style={{ marginBottom: 16 }}>{resultsLabel}</p>}

            {loading && <Spinner fullPage label="Loading products..." />}

            {!loading && error && (
                <StateMessage
                    icon="⚠️"
                    title="Couldn't load products"
                    message={error}
                    action={<button className="btn btn--primary" onClick={() => updateParams({})}>Try again</button>}
                />
            )}

            {!loading && !error && products.length === 0 && (
                <StateMessage
                    icon="🔍"
                    title="No products found"
                    message="Try a different search term or clear your filters."
                    action={hasActiveFilters && (
                        <button className="btn btn--primary" onClick={clearFilters}>Clear filters</button>
                    )}
                />
            )}

            {!loading && !error && products.length > 0 && (
                <>
                    <div className="grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParams({ page: String(p) })} />
                </>
            )}
        </div>
    );
}

export default Products;
