import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const updateCart = (updatedCart) => {
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    setCart(updatedCart);

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(
      (item) => item._id !== productId
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (productId) => {
    const updatedCart = cart.map((item) =>
      item._id === productId && item.quantity > 1
        ? {
            ...item,
            quantity: item.quantity - 1,
          }
        : item
    );

    updateCart(updatedCart);
  };

  const increaseQuantity = (productId) => {
    const updatedCart = cart.map((item) => {
      if (item._id !== productId) {
        return item;
      }

      if (item.quantity >= item.stock) {
        alert(
          `Only ${item.stock} item(s) available in stock.`
        );

        return item;
      }

      return {
        ...item,
        quantity: item.quantity + 1,
      };
    });

    updateCart(updatedCart);
  };

  const totalPrice = cart.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>Shopping Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((product) => (
            <div
              key={product._id}
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <div>
                <h2>{product.name}</h2>

                <p>{product.description}</p>

                <h3>₹{product.price}</h3>

                <p>
                  Available Stock: {product.stock}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <button
                    onClick={() =>
                      decreaseQuantity(product._id)
                    }
                    disabled={product.quantity <= 1}
                    style={{
                      padding: "5px 12px",
                      cursor:
                        product.quantity <= 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    −
                  </button>

                  <span>{product.quantity}</span>

                  <button
                    onClick={() =>
                      increaseQuantity(product._id)
                    }
                    disabled={
                      product.quantity >= product.stock
                    }
                    style={{
                      padding: "5px 12px",
                      cursor:
                        product.quantity >= product.stock
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() =>
                    removeFromCart(product._id)
                  }
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    border: "none",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <h2>Total: ₹{totalPrice}</h2>

          <button
            onClick={() => navigate("/checkout")}
            style={{
              padding: "12px 24px",
              marginTop: "10px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "6px",
              border: "none",
            }}
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;