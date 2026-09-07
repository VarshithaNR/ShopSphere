function ProductCard({ product }) {
  return (
    <div
      style={{
        width: "280px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        margin: "10px",
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

      <h3>₹{product.price}</h3>

      <p>Brand: {product.brand}</p>

      <p>⭐ {product.rating}</p>

      <p>Stock: {product.stock}</p>
    </div>
  );
}

export default ProductCard;