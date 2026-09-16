import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, updateProduct } from "../../api/productApi";
import { getErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";
import StateMessage from "../../components/StateMessage";

const EMPTY_FORM = { name: "", description: "", price: "", category: "", brand: "", image: "", stock: "" };

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchProduct = async () => {
            setLoading(true);
            setLoadError("");
            try {
                const data = await getProductById(id);
                if (cancelled) return;
                const product = data.product;
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: String(product.price),
                    category: product.category,
                    brand: product.brand,
                    image: product.image,
                    stock: String(product.stock),
                });
            } catch (err) {
                if (!cancelled) setLoadError(getErrorMessage(err, "Failed to load product."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProduct();
        return () => { cancelled = true; };
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors((current) => ({ ...current, [e.target.name]: undefined }));
    };

    const validate = () => {
        const next = {};
        if (!formData.name.trim()) next.name = "Product name is required.";
        if (!formData.description.trim()) next.description = "Description is required.";
        if (formData.price === "" || Number(formData.price) < 0) next.price = "Enter a valid price.";
        if (!formData.category.trim()) next.category = "Category is required.";
        if (!formData.brand.trim()) next.brand = "Brand is required.";
        if (!formData.image.trim()) next.image = "Image URL is required.";
        if (formData.stock === "" || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
            next.stock = "Enter a valid whole-number stock quantity.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await updateProduct(id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                category: formData.category.trim(),
                brand: formData.brand.trim(),
                image: formData.image.trim(),
                stock: Number(formData.stock),
            });

            toast.success("Product updated successfully!");
            navigate("/admin/products");
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to update product."));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner fullPage label="Loading product..." />;

    if (loadError) {
        return (
            <StateMessage
                icon="⚠️"
                title="Couldn't load this product"
                message={loadError}
                action={<Link to="/admin/products" className="btn btn--primary">Back to Products</Link>}
            />
        );
    }

    return (
        <div>
            <Link to="/admin/products" className="text-sm">← Back to Products</Link>
            <h1>Edit Product</h1>

            <form className="form-card" onSubmit={handleSubmit} noValidate style={{ maxWidth: 640 }}>
                <div className="field">
                    <label htmlFor="name">Product Name</label>
                    <input id="name" name="name" className={`input${errors.name ? " has-error" : ""}`}
                        value={formData.name} onChange={handleChange} />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" rows="4"
                        className={`textarea${errors.description ? " has-error" : ""}`}
                        value={formData.description} onChange={handleChange} />
                    {errors.description && <p className="field-error">{errors.description}</p>}
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="field">
                        <label htmlFor="price">Price (₹)</label>
                        <input id="price" type="number" name="price" min="0" step="0.01"
                            className={`input${errors.price ? " has-error" : ""}`}
                            value={formData.price} onChange={handleChange} />
                        {errors.price && <p className="field-error">{errors.price}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="stock">Stock</label>
                        <input id="stock" type="number" name="stock" min="0" step="1"
                            className={`input${errors.stock ? " has-error" : ""}`}
                            value={formData.stock} onChange={handleChange} />
                        {errors.stock && <p className="field-error">{errors.stock}</p>}
                    </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="field">
                        <label htmlFor="category">Category</label>
                        <input id="category" name="category" className={`input${errors.category ? " has-error" : ""}`}
                            value={formData.category} onChange={handleChange} />
                        {errors.category && <p className="field-error">{errors.category}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="brand">Brand</label>
                        <input id="brand" name="brand" className={`input${errors.brand ? " has-error" : ""}`}
                            value={formData.brand} onChange={handleChange} />
                        {errors.brand && <p className="field-error">{errors.brand}</p>}
                    </div>
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="image">Image URL</label>
                    <input id="image" type="url" name="image" className={`input${errors.image ? " has-error" : ""}`}
                        value={formData.image} onChange={handleChange} />
                    {errors.image && <p className="field-error">{errors.image}</p>}
                    {formData.image && !errors.image && (
                        <img src={formData.image} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
                    )}
                </div>

                <button type="submit" className="btn btn--primary" disabled={saving} style={{ marginTop: 20 }}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}

export default EditProduct;
