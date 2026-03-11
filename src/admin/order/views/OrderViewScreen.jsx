import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import * as orderController from "../controllers/orderController";
import {
  FiArrowLeft,
  FiUser,
  FiTruck,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiTool,
} from "react-icons/fi";
import "./OrderViewScreen.css";

const OrderViewScreen = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!currentUser || !orderId) return;

    try {
      setLoading(true);
      const result = await orderController.fetchOrderById(
        currentUser.uid,
        orderId,
      );

      if (result.success) {
        setOrder(result.order);
        setError(null);
      } else {
        setError("Order not found.");
      }
    } catch (fetchError) {
      console.error("Error fetching order:", fetchError);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const result = await orderController.updateOrderStatus(
        orderId,
        newStatus,
      );
      if (result.success) {
        setOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      // Using an empty catch or renaming it avoids the 'unused-vars' error
      alert("Failed to update status. Please check your connection.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  if (error)
    return (
      <div className="error-container">
        {error} <Link to="/admin/orders">Go Back</Link>
      </div>
    );
  if (!order) return null;

  return (
    <div className="order-view-container">
      <header className="order-view-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back to Orders
        </button>
        <div className="header-title">
          <h1>Order #{orderId.slice(-6).toUpperCase()}</h1>
          <span className={`status-badge ${order.status?.toLowerCase()}`}>
            {order.status || "Pending"}
          </span>
        </div>
      </header>

      <div className="order-grid">
        <div className="order-main">
          <section className="order-card">
            <h3>
              <FiPackage /> Order Items
            </h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items &&
                  order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="order-total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${order.subtotal || 0}</span>
              </div>
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span>${order.totalAmount || 0}</span>
              </div>
            </div>
          </section>

          <section className="order-card">
            <h3>
              <FiTool /> Admin Actions
            </h3>
            <div className="action-buttons">
              <button
                disabled={updating || order.status === "Shipped"}
                onClick={() => handleUpdateStatus("Shipped")}
                className="btn-shipped"
              >
                <FiTruck /> Mark as Shipped
              </button>
              <button
                disabled={updating || order.status === "Delivered"}
                onClick={() => handleUpdateStatus("Delivered")}
                className="btn-delivered"
              >
                <FiCheckCircle /> Mark as Delivered
              </button>
              <button
                disabled={updating || order.status === "Cancelled"}
                onClick={() => handleUpdateStatus("Cancelled")}
                className="btn-cancelled"
              >
                <FiXCircle /> Cancel Order
              </button>
            </div>
          </section>
        </div>

        <div className="order-sidebar">
          <section className="order-card">
            <h3>
              <FiUser /> Customer
            </h3>
            <p>
              <strong>Name:</strong> {order.deliveryAddress?.fullName || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {order.deliveryAddress?.phone || "N/A"}
            </p>
          </section>

          <section className="order-card">
            <h3>
              <FiTruck /> Shipping Address
            </h3>
            <p>{order.deliveryAddress?.address}</p>
            <p>
              {order.deliveryAddress?.city}, {order.deliveryAddress?.landmark}
            </p>
            <p>Pincode: {order.deliveryAddress?.pincode}</p>
          </section>

          <section className="order-card">
            <h3>
              <FiCreditCard /> Payment
            </h3>
            <p>
              <strong>Method:</strong>{" "}
              {order.paymentMethod === "cod"
                ? "💰 Cash on Delivery"
                : order.paymentMethod === "upi"
                  ? "📱 UPI Payment"
                  : order.paymentMethod === "card"
                    ? "💳 Credit/Debit Card"
                    : order.paymentMethodSelected
                      ? "Online"
                      : "COD"}
            </p>
            <p>
              <strong>Status:</strong> {order.paymentStatus || "Pending"}
            </p>
          </section>

          {/* Plumber Service Details */}
          {order.plumberService && (
            <section className="order-card plumber-service-card">
              <h3>🔧 Plumber Service</h3>
              <div className="plumber-details">
                <p>
                  <strong>Name:</strong> {order.plumberService.name || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> 📞{" "}
                  {order.plumberService.phone || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {order.plumberService.date
                    ? new Date(order.plumberService.date).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
                {order.plumberService.time && (
                  <p>
                    <strong>Time:</strong>{" "}
                    {order.plumberService.time === "08:00"
                      ? "8:00 AM"
                      : order.plumberService.time === "09:00"
                        ? "9:00 AM"
                        : order.plumberService.time === "10:00"
                          ? "10:00 AM"
                          : order.plumberService.time === "11:00"
                            ? "11:00 AM"
                            : order.plumberService.time === "12:00"
                              ? "12:00 PM"
                              : order.plumberService.time === "13:00"
                                ? "1:00 PM"
                                : order.plumberService.time === "14:00"
                                  ? "2:00 PM"
                                  : order.plumberService.time === "15:00"
                                    ? "3:00 PM"
                                    : order.plumberService.time === "16:00"
                                      ? "4:00 PM"
                                      : order.plumberService.time === "17:00"
                                        ? "5:00 PM"
                                        : order.plumberService.time === "18:00"
                                          ? "6:00 PM"
                                          : order.plumberService.time}
                  </p>
                )}
                <p>
                  <strong>Area:</strong> 📍 {order.plumberService.area},{" "}
                  {order.plumberService.city}
                </p>
                <p>
                  <strong>Experience:</strong> {order.plumberService.experience}{" "}
                  years
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {order.plumberService.specialization}
                </p>
                <p>
                  <strong>Hourly Rate:</strong> ₹
                  {order.plumberService.hourlyRate}/hour
                </p>
                <p>
                  <strong>Service Fee:</strong> ₹
                  {order.plumberService.serviceFee}
                </p>
              </div>
            </section>
          )}

          <section className="order-card">
            <h3>
              <FiClock /> Order Timeline
            </h3>
            <ul className="timeline">
              <li>Created: {order.createdAt}</li>
              {order.updatedAt && <li>Last Updated: {order.updatedAt}</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderViewScreen;
