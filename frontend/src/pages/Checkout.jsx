import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderApi";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("Cash on Delivery");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || [];

    if (savedCart.length === 0) {
      navigate("/cart");
      return;
    }

    setCart(savedCart);
  }, [navigate]);

  const totalAmount = cart.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const currentCart =
        JSON.parse(localStorage.getItem("cart")) || [];

      if (currentCart.length === 0) {
        alert("Your cart is empty.");
        navigate("/cart");
        return;
      }

      const items = currentCart.map((product) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      }));

      const currentTotal = currentCart.reduce(
        (total, product) =>
          total + product.price * product.quantity,
        0
      );

      const orderData = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        items,
        totalAmount: currentTotal,
        paymentMethod,
      };

      const data = await createOrder(orderData);

      if (data.success) {
        localStorage.removeItem("cart");

        window.dispatchEvent(
          new Event("cartUpdated")
        );

        navigate("/order-success");
      }
    } catch (error) {
      console.error(
        "Failed to place order:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>Checkout</h1>

      <h2>Order Summary</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        {cart.map((product) => (
          <div
            key={product._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              padding: "15px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />

              <div>
                <h3
                  style={{
                    margin: "0 0 5px",
                  }}
                >
                  {product.name}
                </h3>

                <p style={{ margin: "0" }}>
                  ₹{product.price} ×{" "}
                  {product.quantity}
                </p>
              </div>
            </div>

            <strong>
              ₹
              {product.price *
                product.quantity}
            </strong>
          </div>
        ))}

        <h2
          style={{
            textAlign: "right",
            marginTop: "20px",
          }}
        >
          Total: ₹{totalAmount}
        </h2>
      </div>

      <h2>Shipping Information</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Full Name</label>
          <br />

          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <br />

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Address</label>
          <br />

          <textarea
            name="address"
            placeholder="Enter your address"
            rows="4"
            value={formData.address}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Phone Number</label>
          <br />

          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <h2>Payment Method</h2>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={
                paymentMethod === "Cash on Delivery"
              }
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
            />{" "}
            Cash on Delivery
          </label>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="UPI"
              checked={paymentMethod === "UPI"}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
            />{" "}
            UPI
          </label>

          <label
            style={{
              display: "block",
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Card"
              checked={paymentMethod === "Card"}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
            />{" "}
            Card
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
            borderRadius: "6px",
            border: "none",
          }}
        >
          {loading
            ? "Placing Order..."
            : `Place Order - ₹${totalAmount}`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;