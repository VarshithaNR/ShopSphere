import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orderApi";

function Checkout() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.length === 0) {
        alert("Your cart is empty.");
        navigate("/cart");
        return;
      }

      const items = cart.map((product) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      }));

      const totalAmount = cart.reduce(
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
        totalAmount,
      };

      const data = await createOrder(orderData);

      if (data.success) {
        localStorage.removeItem("cart");

        window.dispatchEvent(new Event("cartUpdated"));

        navigate("/order-success");
      }
    } catch (error) {
      console.error("Failed to place order:", error);

      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h1>Checkout</h1>

      <h2>Shipping Information</h2>

      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div style={{ marginBottom: "15px" }}>
          <label>Full Name</label>
          <br />

          <input
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({
                ...formData,
                fullName: e.target.value,
              })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <br />

          <input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        {/* Address */}
        <div style={{ marginBottom: "15px" }}>
          <label>Address</label>
          <br />

          <textarea
            placeholder="Enter your address"
            rows="4"
            value={formData.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value,
              })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "15px" }}>
          <label>Phone Number</label>
          <br />

          <input
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
        </div>

        {/* Place Order */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            borderRadius: "6px",
            border: "none",
          }}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;