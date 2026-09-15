import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/productApi";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(
          `/products/${id}`
        );

        setProduct(response.data.product);
      } catch (error) {
        console.error(
          "Failed to fetch product:",
          error
        );
      }
    };

    fetchProduct();
  }, [id]);

  const decreaseQuantity = () => {
    setQuantity((currentQuantity) =>
      Math.max(1, currentQuantity - 1)
    );
  };

  const increaseQuantity = () => {
    if (quantity >= product.stock) {
      alert(
        `Only ${product.stock} item(s) available in stock.`
      );

      return;
    }

    setQuantity((currentQuantity) =>
      currentQuantity + 1
    );
  };

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
      const newQuantity =
        existingProduct.quantity + quantity;

      if (newQuantity > product.stock) {
        alert(
          `Only ${product.stock} item(s) available in stock.`
        );

        return;
      }

      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cartUpdated")
    );

    navigate("/cart");
  };

  if (!product) {
    return (
      <p style={{ padding: "30px" }}>
        Loading product...
      </p>
    );
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

      <p>
        <strong>Brand:</strong>{" "}
        {product.brand}
      </p>

      <p>
        <strong>Rating:</strong> ⭐{" "}
        {product.rating}
      </p>

      <p>
        <strong>Stock:</strong>{" "}
        {isOutOfStock
          ? "Out of Stock"
          : product.stock}
      </p>

      {!isOutOfStock && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0",
          }}
        >
          <strong>Quantity:</strong>

          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            style={{
              padding: "6px 12px",
              cursor:
                quantity <= 1
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            −
          </button>

          <span
            style={{
              minWidth: "30px",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            {quantity}
          </span>

          <button
            onClick={increaseQuantity}
            disabled={
              quantity >= product.stock
            }
            style={{
              padding: "6px 12px",
              cursor:
                quantity >= product.stock
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            +
          </button>
        </div>
      )}

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
        {isOutOfStock
          ? "Out of Stock"
          : `Add ${quantity} to Cart`}
      </button>
    </div>
  );
}

export default ProductDetails;