import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
      );

      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );
    };
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        borderBottom: "1px solid #ddd",
        flexWrap: "wrap",
        gap: "15px",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "black",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        ShopSphere
      </Link>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Products
        </Link>

        <Link
          to="/orders"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Orders
        </Link>

        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Cart ({cartCount})
        </Link>

        <Link
          to="/admin/products"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Admin Products
        </Link>

        <Link
          to="/admin/orders"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Admin Orders
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;