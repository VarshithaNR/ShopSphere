import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../../api/productApi";
import { getErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const EMPTY_FORM = { name: "", description: "", price: "", category: "", brand: "", image: "", stock: "" };

function AddProduct() {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            await createProduct({
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price),
                category: formData.category.trim(),
                brand: formData.brand.trim(),
                image: formData.image.trim(),
                stock: Number(formData.stock),
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to add product."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Link to="/admin/products" className="text-sm">← Back to Products</Link>
            <h1>Add Product</h1>

            <form className="form-card" onSubmit={handleSubmit} noValidate style={{ maxWidth: 640 }}>
                <div className="field">
                    <label htmlFor="name">Product Name</label>
                    <input id="name" name="name" className={`input${errors.name ? " has-error" : ""}`}
                        placeholder="Enter product name" value={formData.name} onChange={handleChange} />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" rows="4"
                        className={`textarea${errors.description ? " has-error" : ""}`}
                        placeholder="Enter product description" value={formData.description} onChange={handleChange} />
                    {errors.description && <p className="field-error">{errors.description}</p>}
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="field">
                        <label htmlFor="price">Price (₹)</label>
                        <input id="price" type="number" name="price" min="0" step="0.01"
                            className={`input${errors.price ? " has-error" : ""}`}
                            placeholder="0.00" value={formData.price} onChange={handleChange} />
                        {errors.price && <p className="field-error">{errors.price}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="stock">Stock</label>
                        <input id="stock" type="number" name="stock" min="0" step="1"
                            className={`input${errors.stock ? " has-error" : ""}`}
                            placeholder="0" value={formData.stock} onChange={handleChange} />
                        {errors.stock && <p className="field-error">{errors.stock}</p>}
                    </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="field">
                        <label htmlFor="category">Category</label>
                        <input id="category" name="category" className={`input${errors.category ? " has-error" : ""}`}
                            placeholder="e.g. Electronics" value={formData.category} onChange={handleChange} />
                        {errors.category && <p className="field-error">{errors.category}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="brand">Brand</label>
                        <input id="brand" name="brand" className={`input${errors.brand ? " has-error" : ""}`}
                            placeholder="e.g. Acme" value={formData.brand} onChange={handleChange} />
                        {errors.brand && <p className="field-error">{errors.brand}</p>}
                    </div>
                </div>

                <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="image">Image URL</label>
                    <input id="image" type="url" name="image" className={`input${errors.image ? " has-error" : ""}`}
                        placeholder="https://..." value={formData.image} onChange={handleChange} />
                    {errors.image && <p className="field-error">{errors.image}</p>}
                    {formData.image && !errors.image && (
                        <img src={formData.image} alt="Preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />
                    )}
                </div>

                <button type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: 20 }}>
                    {loading ? "Adding Product..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}

export default AddProduct;
