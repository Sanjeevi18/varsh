import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as orderController from "../controllers/orderController";
import {
  FiEye,
  FiTrash2,
  FiClock,
  FiAlertCircle,
  FiUser,
  FiCheck,
  FiX,
} from "react-icons/fi";
import "./OrderManagement.css";
import "../../Dashboard.css";

const OrderManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await orderController.fetchOrders(currentUser.uid);
      if (result.success) {
        setOrders(result.orders);
        setFilteredOrders(result.orders);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filterOrders = (status) => {
    setFilterStatus(status);
    if (status === "All") {
      setFilteredOrders(orders);
    } else if (status === "With Plumber") {
      setFilteredOrders(
        orders.filter((order) => order.plumberSelected === true),
      );
    } else {
      setFilteredOrders(orders.filter((order) => order.status === status));
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const result = await orderController.deleteOrder(
        currentUser.uid,
        orderId,
      );
      if (result.success) fetchOrders();
    } catch {
      alert("Error deleting order");
    }
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "status-completed";
    if (s === "processing") return "status-processing";
    if (s === "cancelled") return "status-cancelled";
    return "status-pending";
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Sports Shop Admin</div>
        <nav className="nav-menu">
          <Link to="/admin" className="nav-item">
            Dashboard
          </Link>
          <Link to="/admin/items" className="nav-item">
            Products
          </Link>
          <Link to="/admin/plumbers" className="nav-item">
            Plumbers
          </Link>
          <Link to="/admin/orders" className="nav-item active">
            Orders
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header-bar compact">
          <div className="header-left">
            <h2>Order Management</h2>
            <p>Real-time order tracking and service fulfillment</p>
          </div>
          <div className="header-profile">
            <span>{currentUser?.email}</span>
            <button onClick={() => navigate("/signin")} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="page-content">
          {error && (
            <div className="error-message">
              <FiAlertCircle /> {error}
            </div>
          )}

          <div className="filter-chips">
            {[
              "All",
              "Pending",
              "Processing",
              "Completed",
              "Cancelled",
              "With Plumber",
            ].map((status) => (
              <button
                key={status}
                className={`chip ${filterStatus === status ? "active" : ""}`}
                onClick={() => filterOrders(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="table-container shadow-sm">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Timing</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Plumber Service</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="id-cell">
                        <strong>
                          #{order.orderId?.slice(-6).toUpperCase()}
                        </strong>
                        <span className="sub-text">
                          User: {order.userId?.slice(0, 6)}
                        </span>
                      </td>

                      <td>
                        <div className="timing-box">
                          <span className="date-row">
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                          <span className="time-row">
                            <FiClock size={11} />{" "}
                            {order.orderDate
                              ? new Date(order.orderDate).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )
                              : ""}
                          </span>
                        </div>
                      </td>

                      <td className="amount-only-cell">
                        ₹{order.totalAmount || "0.00"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(order.status)}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        {order.plumberSelected ? (
                          <div className="service-badge required">
                            <FiCheck /> Plumber Required
                          </div>
                        ) : (
                          <div className="service-badge not-required">
                            <FiX /> Not Required
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() =>
                              navigate(`/admin/orders/${order.orderId}`)
                            }
                            title="View Detail"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteOrder(order.orderId)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderManagement;
