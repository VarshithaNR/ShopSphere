import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
      );

      setCartCount(count);
    };

    const updateUser = () => {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    updateCartCount();
    updateUser();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("authUpdated", updateUser);

    return () => {
      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      );

      window.removeEventListener(
        "authUpdated",
        updateUser
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authUpdated"));

    setUser(null);

    navigate("/login");
  };

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

        {user && (
          <Link
            to="/orders"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            Orders
          </Link>
        )}

        <Link
          to="/cart"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          Cart ({cartCount})
        </Link>

        {user?.role === "admin" && (
          <>
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
          </>
        )}

        {user ? (
          <>
            <span>
              Welcome, {user.name}
            </span>

            <button
              onClick={handleLogout}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                borderRadius: "6px",
                border: "none",
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                textDecoration: "none",
                color: "black",
              }}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={{
                textDecoration: "none",
                color: "black",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;