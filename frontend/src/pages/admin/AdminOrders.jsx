import { useEffect, useState } from "react";
import API from "../../api/productApi";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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
      console.error(
        "Failed to fetch admin orders:",
        error
      );

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

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      setUpdatingOrderId(orderId);

      const token = localStorage.getItem("token");

      const response = await API.put(
        `/admin/orders/${orderId}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: response.data.order.status,
              }
            : order
        )
      );

      alert("Order status updated successfully!");
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to update order status.";

      alert(message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

            <div style={{ marginBottom: "20px" }}>
              <label>
                <strong>Update Status:</strong>
              </label>

              <br />

              <select
                value={order.status}
                disabled={
                  updatingOrderId === order._id
                }
                onChange={(e) =>
                  handleStatusChange(
                    order._id,
                    e.target.value
                  )
                }
                style={{
                  padding: "10px",
                  marginTop: "8px",
                  fontSize: "16px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="Pending">
                  Pending
                </option>

                <option value="Confirmed">
                  Confirmed
                </option>

                <option value="Shipped">
                  Shipped
                </option>

                <option value="Delivered">
                  Delivered
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>

              {updatingOrderId === order._id && (
                <span style={{ marginLeft: "10px" }}>
                  Updating...
                </span>
              )}
            </div>

            <p>
              <strong>Total Amount:</strong> ₹
              {order.totalAmount}
            </p>

            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod ||
                "Not specified"}
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