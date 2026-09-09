import { useEffect, useState } from "react";
import API from "../../api/productApi";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders);
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);

      if (error.response?.status === 401) {
        alert("Please login to access admin orders.");
      }

      if (error.response?.status === 403) {
        alert("Access denied. Admin only.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>Admin - Order Management</h1>

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
              marginTop: "20px",
            }}
          >
            <h2>Order #{order._id}</h2>

            <p>
              <strong>Status:</strong>{" "}
              {order.status}
            </p>

            <p>
              <strong>Total Amount:</strong> ₹
              {order.totalAmount}
            </p>

            <h3>Customer Information</h3>

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

            <h3>Ordered Products</h3>

            {order.items.map((item) => (
              <div
                key={item._id}
                style={{
                  borderTop: "1px solid #eee",
                  padding: "10px 0",
                }}
              >
                <p>
                  <strong>{item.name}</strong>
                </p>

                <p>
                  Price: ₹{item.price}
                </p>

                <p>
                  Quantity: {item.quantity}
                </p>

                <p>
                  Subtotal: ₹
                  {item.price * item.quantity}
                </p>
              </div>
            ))}

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

export default AdminOrders;