import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import * as userOrderService from "./order/services/userOrderService";
import {
  FiDownload,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShoppingBag,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";
import "./UserOrders.css";

const UserOrders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Error state now used below

  const fetchUserOrders = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(""); // Reset error on retry
    try {
      const result = await userOrderService.getUserOrders(currentUser.uid);
      if (result.success) {
        const sortedOrders = result.orders.sort(
          (a, b) =>
            new Date(b.orderDate || b.createdAt) -
            new Date(a.orderDate || a.createdAt),
        );
        setOrders(sortedOrders);
      } else {
        setError(result.error || "Failed to fetch your orders.");
      }
    } catch (err) {
      // Fix: Used the catch variable for logging to satisfy ESLint
      console.error("Order Fetch Error:", err);
      setError(
        "Unable to connect to the server. Please check your connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    fetchUserOrders();
  }, [currentUser, navigate, fetchUserOrders]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    if (["completed", "delivered"].includes(s))
      return { class: "status-completed", icon: <FiCheckCircle /> };
    if (["shipped", "out for delivery", "processing"].includes(s))
      return { class: "status-processing", icon: <FiTruck /> };
    if (s === "cancelled")
      return { class: "status-cancelled", icon: <FiXCircle /> };
    return { class: "status-pending", icon: <FiClock /> };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const downloadBill = (order) => {
    const billHtml = `
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
            .service-box { background: #f0f9ff; padding: 15px; border-radius: 5px; margin-top: 20px; border: 1px solid #bae6fd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <p><strong>Order ID:</strong> #ORD-${order.orderId?.toUpperCase() || order.id?.toUpperCase()}</p>
            <p><strong>Date:</strong> ${formatDate(order.orderDate || order.createdAt)}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${order.items
                ?.map(
                  (item) => `
                <tr>
                  <td>${item.itemName || item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          ${
            order.plumberSelected
              ? `
            <div class="service-box">
              <strong>Plumber Service Requested</strong><br/>
              Status: Assigned for Scheduled Delivery Date<br/>
              Location: ${order.plumberService?.area || "Customer Address"}
            </div>
          `
              : ""
          }
          <div class="total">Total Amount: ₹${Number(order.totalAmount || 0).toLocaleString()}</div>
          <p style="text-align: center; margin-top: 50px; color: #666;">Thank you for your business!</p>
        </body>
      </html>
    `;
    const blob = new Blob([billHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_ORD_${order.orderId?.slice(-6) || "Order"}.html`;
    link.click();
  };

  if (loading)
    return (
      <div className="orders-page">
        <Header />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track your purchases and service status</p>
        </div>

        {/* ERROR MESSAGE UI - Uses the 'error' variable */}
        {error && (
          <div className="error-alert">
            <FiAlertCircle />
            <span>{error}</span>
            <button onClick={fetchUserOrders}>Try Again</button>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="empty-state">
            <FiShoppingBag size={50} />
            <h2>No orders yet</h2>
            <p>When you buy items, they will appear here.</p>
            <Link to="/products" className="shop-link">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => {
              const status = getStatusConfig(order.status);
              return (
                <div key={order.id} className="order-card-compact">
                  <div className="card-header">
                    <span className="order-id">
                      #ORD-{order.orderId?.slice(-6).toUpperCase()}
                    </span>
                    <div className={`status-tag ${status.class}`}>
                      {status.icon} {order.status || "Pending"}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="order-details">
                      <p className="date-text">
                        {formatDate(order.orderDate || order.createdAt)}
                      </p>
                      <div className="item-summary-list">
                        {order.items?.map((item, i) => (
                          <div key={i} className="item-line">
                            <span>
                              {item.itemName || item.name} (x{item.quantity})
                            </span>
                            <span>
                              ₹
                              {Number(
                                item.price * item.quantity,
                              ).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.plumberSelected && (
                      <div className="plumber-needed-tag">
                        <FiUser /> Plumber Service Requested
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <div className="price-total">
                      <small>Paid Amount</small>
                      <p>₹{Number(order.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <button
                      className="download-bill-btn"
                      onClick={() => downloadBill(order)}
                    >
                      <FiDownload /> Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserOrders;
