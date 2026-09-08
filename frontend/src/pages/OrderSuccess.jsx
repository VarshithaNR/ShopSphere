import { useNavigate } from "react-router-dom";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "50px 30px",
        textAlign: "center",
      }}
    >
      <h1>🎉 Order Placed Successfully!</h1>

      <p>
        Thank you for shopping with ShopSphere.
      </p>

      <p>
        Your order has been placed successfully.
      </p>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 24px",
          marginTop: "20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "6px",
          border: "none",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default OrderSuccess;