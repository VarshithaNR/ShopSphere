import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/productApi";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");
      setProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`/products/${productId}`);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product._id !== productId
        )
      );
    } catch (error) {
      console.error("Failed to delete product:", error);

      alert("Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <p style={{ padding: "30px" }}>
        Loading products...
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>Admin - Product Management</h1>

      <button
        onClick={() => navigate("/admin/products/add")}
        style={{
          padding: "12px 20px",
          marginTop: "15px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "none",
          fontSize: "16px",
        }}
      >
        + Add Product
      </button>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <h2>{product.name}</h2>

              <p>{product.description}</p>

              <p>
                <strong>Price:</strong> ₹{product.price}
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {product.category}
              </p>

              <p>
                <strong>Brand:</strong> {product.brand}
              </p>

              <p>
                <strong>Stock:</strong> {product.stock}
              </p>

              <p>
                <strong>Rating:</strong> ⭐ {product.rating}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() =>
                    navigate(
                      `/admin/products/edit/${product._id}`
                    )
                  }
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "none",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(product._id)
                  }
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "none",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminProducts;