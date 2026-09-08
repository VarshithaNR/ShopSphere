import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/productApi";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      return;
    }

    const existingCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    const existingProduct = existingCart.find(
      (item) => item._id === product._id
    );

    let updatedCart;

    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        alert("No more stock available for this product.");
        return;
      }

      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/cart");
  };

  if (!product) {
    return <p>Loading product...</p>;
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        style={{
          width: "300px",
          height: "300px",
          objectFit: "cover",
          borderRadius: "10px",
        }}
      />

      <h1>{product.name}</h1>

      <p>{product.description}</p>

      <h2>₹{product.price}</h2>

      <p>Brand: {product.brand}</p>

      <p>⭐ {product.rating}</p>

      <p>
        Stock:{" "}
        {isOutOfStock ? "Out of Stock" : product.stock}
      </p>

      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: isOutOfStock
            ? "not-allowed"
            : "pointer",
          borderRadius: "6px",
          border: "none",
          opacity: isOutOfStock ? 0.5 : 1,
        }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

export default ProductDetails;