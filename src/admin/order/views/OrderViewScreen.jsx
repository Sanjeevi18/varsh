import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as orderService from "../services/orderService";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPackage,
  FiCreditCard,
  FiCalendar,
  FiPhone,
  FiClock,
  FiDollarSign,
  FiTool,
  FiMail,
} from "react-icons/fi";
import "./OrderViewScreen.css";

const OrderViewScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await orderService.getOrderById(null, orderId);

        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const timeMap = {
      "08:00": "8:00 AM",
      "09:00": "9:00 AM",
      "10:00": "10:00 AM",
      "11:00": "11:00 AM",
      "12:00": "12:00 PM",
      "13:00": "1:00 PM",
      "14:00": "2:00 PM",
      "15:00": "3:00 PM",
      "16:00": "4:00 PM",
      "17:00": "5:00 PM",
      "18:00": "6:00 PM",
    };
    return timeMap[timeString] || timeString;
  };
  if (loading) {
    return (
      <div className="order-view-screen">
        <div className="loading-spinner">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-view-screen">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn-back"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-view-screen">
        <div className="error-message">
          <h2>Order Not Found</h2>
          <p>The requested order could not be found.</p>
          <button
            onClick={() => navigate("/admin/orders")}
            className="btn-back"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-view-screen">
      {/* Header */}
      <div className="view-header">
        <button onClick={() => navigate("/admin/orders")} className="btn-back">
          <FiArrowLeft /> Back to Orders
        </button>
        <h1 className="view-title">
          Order #{order.orderNumber || order.id?.slice(-8).toUpperCase()}
        </h1>
      </div>

      {/* Order Details Container */}
      <div className="order-details-container">
        {/* Customer Information */}
        <section className="details-card">
          <div className="card-header">
            <h2>
              <FiUser /> Customer Information
            </h2>
            <span
              className={`status-badge status-${order.status?.toLowerCase() || "pending"}`}
            >
              {order.status || "Pending"}
            </span>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Customer Name:</span>
              <span className="info-value">
                {order.customerInfo?.name || order.customerName || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">
                <FiMail /> {order.customerInfo?.email || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">
                <FiPhone /> {order.customerInfo?.phone || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">
                <FiCalendar /> {formatDate(order.orderDate || order.createdAt)}
              </span>
            </div>
          </div>
        </section>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <section className="details-card">
            <div className="card-header">
              <h2>
                <FiMapPin /> Delivery Address
              </h2>
            </div>
            <div className="card-body">
              <div className="address-details">
                <p>{order.deliveryAddress.street || "N/A"}</p>
                <p>
                  {order.deliveryAddress.city || "N/A"},{" "}
                  {order.deliveryAddress.state || "N/A"}
                </p>
                <p>Pin Code: {order.deliveryAddress.postalCode || "N/A"}</p>
              </div>
            </div>
          </section>
        )}

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <section className="details-card">
            <div className="card-header">
              <h2>
                <FiPackage /> Order Items ({order.items.length})
              </h2>
            </div>
            <div className="card-body">
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-info">
                      <h4>{item.itemName || item.name || "Unknown Item"}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      <span>₹{(item.price || 0).toFixed(2)} each</span>
                      <strong>
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
                <div className="items-total">
                  <strong>
                    Items Total: ₹{(order.subtotal || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Payment Details */}
        <section className="details-card">
          <div className="card-header">
            <h2>
              <FiCreditCard /> Payment Details
            </h2>
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Payment Method:</span>
              <span className="info-value">
                {order.paymentMethod === "cod"
                  ? "💰 Cash on Delivery"
                  : order.paymentMethod === "upi"
                    ? "📱 UPI Payment"
                    : order.paymentMethod === "card"
                      ? "💳 Credit/Debit Card"
                      : order.paymentMethod || "COD"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Status:</span>
              <span className="info-value">
                {order.paymentStatus || "Pending"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Amount:</span>
              <span className="info-value">
                <FiDollarSign />{" "}
                <strong>
                  ₹{(order.totalAmount || order.total || 0).toFixed(2)}
                </strong>
              </span>
            </div>
          </div>
        </section>

        {/* Plumber Service Details */}
        {order.plumberService && (
          <section className="details-card plumber-service-card">
            <div className="card-header">
              <h2>
                <FiTool /> Plumber Service Booking
              </h2>
            </div>
            <div className="card-body">
              <div className="plumber-details">
                <div className="info-row">
                  <span className="info-label">Plumber Name:</span>
                  <span className="info-value">
                    <FiUser /> {order.plumberService.name || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone Number:</span>
                  <span className="info-value">
                    <FiPhone /> {order.plumberService.phone || "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Service Date:</span>
                  <span className="info-value">
                    <FiCalendar />{" "}
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
                  </span>
                </div>
                {order.plumberService.time && (
                  <div className="info-row">
                    <span className="info-label">Service Time:</span>
                    <span className="info-value">
                      <FiClock /> {formatTime(order.plumberService.time)}
                    </span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Location:</span>
                  <span className="info-value">
                    <FiMapPin /> {order.plumberService.area},{" "}
                    {order.plumberService.city}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Experience:</span>
                  <span className="info-value">
                    {order.plumberService.experience} years
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Specialization:</span>
                  <span className="info-value">
                    {order.plumberService.specialization}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Hourly Rate:</span>
                  <span className="info-value">
                    <FiDollarSign /> ₹{order.plumberService.hourlyRate || 0}
                    /hour
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Service Fee:</span>
                  <span className="info-value">
                    <FiDollarSign />{" "}
                    <strong>₹{order.plumberService.serviceFee || 0}</strong>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Customer Notes */}
        {order.customerNotes && (
          <section className="details-card">
            <div className="card-header">
              <h2>Customer Notes</h2>
            </div>
            <div className="card-body">
              <p className="notes-text">{order.customerNotes}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default OrderViewScreen;
