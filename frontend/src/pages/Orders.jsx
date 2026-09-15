import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api/orderApi";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();

        setOrders(data.orders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        if (error.response?.status === 401) {
          alert("Please login to view your orders.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <p style={{ padding: "30px" }}>
        Loading orders...
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2>Order #{order._id}</h2>

            <p>
              <strong>Status:</strong>{" "}
              {order.status}
            </p>

            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod ||
                "Not specified"}
            </p>

            <p>
              <strong>Total:</strong> ₹
              {order.totalAmount}
            </p>

            <h3>Order Progress</h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              {[
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
              ].map((status) => {
                const statuses = [
                  "Pending",
                  "Confirmed",
                  "Shipped",
                  "Delivered",
                ];

                const currentIndex =
                  statuses.indexOf(order.status);

                const statusIndex =
                  statuses.indexOf(status);

                const isCompleted =
                  currentIndex >= statusIndex;

                return (
                  <div
                    key={status}
                    style={{
                      padding: "10px 15px",
                      borderRadius: "20px",
                      border: "1px solid #ccc",
                      opacity: isCompleted ? 1 : 0.4,
                      fontWeight:
                        order.status === status
                          ? "bold"
                          : "normal",
                    }}
                  >
                    {isCompleted ? "✓ " : ""}
                    {status}
                  </div>
                );
              })}
            </div>

            {order.status === "Cancelled" && (
              <p
                style={{
                  fontWeight: "bold",
                }}
              >
                This order has been cancelled.
              </p>
            )}

            <h3>Products</h3>

            {order.items.map((item) => (
              <div
                key={item._id}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <p>
                  <strong>{item.name}</strong>
                </p>

                <p>
                  Price: ₹{item.price} × Quantity:{" "}
                  {item.quantity}
                </p>

                <p>
                  Subtotal: ₹
                  {item.price * item.quantity}
                </p>
              </div>
            ))}

            <h3>Shipping Information</h3>

            <p>
              <strong>Name:</strong>{" "}
              {order.customer.fullName}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {order.customer.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {order.customer.phone}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {order.customer.address}
            </p>

            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;