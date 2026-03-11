import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import useCartController from "../cart/controllers/cartController";
import { useAuth } from "../../contexts/AuthContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { handleCheckout, getCartSummary } = useCartController();

  // Get passed data from cart (plumber details etc)
  const passedData = location.state || {};
  const { needsPlumber, plumberService, cartItems } = passedData;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Address Data
  const [addressData, setAddressData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  // Step 2: Payment Data
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Step 3: Order confirmation data
  const [orderNotes, setOrderNotes] = useState("");

  // Check if cart is empty, redirect if so
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Redirecting to products.");
      navigate("/products");
    }
  }, [cartItems, navigate]);

  // Calculate order summary
  const cartSummary = getCartSummary();
  const plumberServiceFee = plumberService?.serviceFee || 0;
  const finalTotal = cartSummary.totalAmount + plumberServiceFee;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateAddress = () => {
    const required = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    return required.every((field) => addressData[field].trim() !== "");
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      handleNext();
    } else {
      alert("Please fill all required fields.");
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod) {
      handleNext();
    } else {
      alert("Please select a payment method.");
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to place your order.");
      return;
    }

    setLoading(true);

    try {
      // Prepare final order data
      const orderDetails = {
        customerNotes: orderNotes,
        deliveryAddress: addressData,
        paymentMethod: paymentMethod,
        plumberService: needsPlumber ? plumberService : null,
      };

      console.log("=== CHECKOUT SUBMISSION ===");
      console.log("User:", user.uid);
      console.log("Address Data:", addressData);
      console.log("Payment Method:", paymentMethod);
      console.log("Plumber Service:", plumberService);
      console.log("Order Details being submitted:", orderDetails);

      const result = await handleCheckout(orderDetails);

      console.log("Checkout result:", result);

      if (result.success) {
        alert(
          `Order placed successfully! Order ID: ${result.order?.id || "N/A"}`,
        );
        navigate("/products", {
          state: {
            message: "Your order has been placed successfully!",
            orderId: result.order?.id,
          },
        });
      } else {
        console.error("Checkout failed:", result.error);
        alert("Failed to process order: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Order submission error:", error);
      alert("Error processing order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
        <div className="step-number">1</div>
        <div className="step-label">Address</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
        <div className="step-number">2</div>
        <div className="step-label">Payment</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
        <div className="step-number">3</div>
        <div className="step-label">Confirm</div>
      </div>
    </div>
  );

  const renderAddressForm = () => (
    <div className="checkout-step address-step">
      <h2>Delivery Address</h2>
      <form onSubmit={handleAddressSubmit} className="address-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={addressData.fullName}
              onChange={(e) =>
                setAddressData({ ...addressData, fullName: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={addressData.phone}
              onChange={(e) =>
                setAddressData({ ...addressData, phone: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address *</label>
          <textarea
            value={addressData.address}
            onChange={(e) =>
              setAddressData({ ...addressData, address: e.target.value })
            }
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              value={addressData.city}
              onChange={(e) =>
                setAddressData({ ...addressData, city: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              value={addressData.state}
              onChange={(e) =>
                setAddressData({ ...addressData, state: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              value={addressData.pincode}
              onChange={(e) =>
                setAddressData({ ...addressData, pincode: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Landmark (Optional)</label>
          <input
            type="text"
            value={addressData.landmark}
            onChange={(e) =>
              setAddressData({ ...addressData, landmark: e.target.value })
            }
          />
        </div>
      </form>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="checkout-step payment-step">
      <h2>Payment Method</h2>
      <form onSubmit={handlePaymentSubmit} className="payment-form">
        <div className="payment-options">
          <label
            className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
          >
            <input
              type="radio"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">💰</div>
              <div>
                <h3>Cash on Delivery</h3>
                <p>Pay when you receive your order</p>
              </div>
            </div>
          </label>

          <label
            className={`payment-option ${paymentMethod === "upi" ? "selected" : ""}`}
          >
            <input
              type="radio"
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">📱</div>
              <div>
                <h3>UPI Payment</h3>
                <p>Pay instantly using UPI apps</p>
              </div>
            </div>
          </label>

          <label
            className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
          >
            <input
              type="radio"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="option-content">
              <div className="option-icon">💳</div>
              <div>
                <h3>Credit/Debit Card</h3>
                <p>Secure card payment</p>
              </div>
            </div>
          </label>
        </div>
      </form>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="order-summary-section">
      <h3>Order Summary</h3>

      {/* Cart Items */}
      <div className="summary-items">
        {cartItems?.map((item, index) => (
          <div key={index} className="summary-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>
                Qty: {item.quantity} × ₹{item.price}
              </p>
            </div>
            <div className="item-total">₹{item.quantity * item.price}</div>
          </div>
        ))}
      </div>

      {/* Plumber Service */}
      {needsPlumber && plumberService && (
        <div className="plumber-summary">
          <h4>Plumber Service</h4>
          <div className="plumber-details">
            <p>
              <strong>Name:</strong> {plumberService.name}
            </p>
            <p>
              <strong>Date:</strong> {plumberService.date}
            </p>
            {plumberService.time && (
              <p>
                <strong>Time:</strong>{" "}
                {plumberService.time === "08:00"
                  ? "8:00 AM"
                  : plumberService.time === "09:00"
                    ? "9:00 AM"
                    : plumberService.time === "10:00"
                      ? "10:00 AM"
                      : plumberService.time === "11:00"
                        ? "11:00 AM"
                        : plumberService.time === "12:00"
                          ? "12:00 PM"
                          : plumberService.time === "13:00"
                            ? "1:00 PM"
                            : plumberService.time === "14:00"
                              ? "2:00 PM"
                              : plumberService.time === "15:00"
                                ? "3:00 PM"
                                : plumberService.time === "16:00"
                                  ? "4:00 PM"
                                  : plumberService.time === "17:00"
                                    ? "5:00 PM"
                                    : plumberService.time === "18:00"
                                      ? "6:00 PM"
                                      : plumberService.time}
              </p>
            )}
            <p>
              <strong>Phone:</strong> {plumberService.phone}
            </p>
            <p>
              <strong>Area:</strong> {plumberService.area},{" "}
              {plumberService.city}
            </p>
            <p>
              <strong>Service Fee:</strong> ₹{plumberService.serviceFee}
            </p>
          </div>
        </div>
      )}

      {/* Order Totals */}
      <div className="order-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>₹{cartSummary.totalAmount}</span>
        </div>
        {plumberServiceFee > 0 && (
          <div className="total-row">
            <span>Plumber Service:</span>
            <span>₹{plumberServiceFee}</span>
          </div>
        )}
        <div className="total-row final-total">
          <span>Total Amount:</span>
          <span>₹{finalTotal}</span>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="checkout-step confirmation-step">
      <h2>Order Confirmation</h2>

      <div className="confirmation-content">
        {/* Delivery Address Summary */}
        <div className="summary-section">
          <h3>Delivery Address</h3>
          <div className="address-summary">
            <p>
              <strong>{addressData.fullName}</strong>
            </p>
            <p>{addressData.phone}</p>
            <p>{addressData.address}</p>
            <p>
              {addressData.city}, {addressData.state} - {addressData.pincode}
            </p>
            {addressData.landmark && <p>Landmark: {addressData.landmark}</p>}
          </div>
        </div>

        {/* Payment Method Summary */}
        <div className="summary-section">
          <h3>Payment Method</h3>
          <p className="payment-summary">
            {paymentMethod === "cod" && "💰 Cash on Delivery"}
            {paymentMethod === "upi" && "📱 UPI Payment"}
            {paymentMethod === "card" && "💳 Credit/Debit Card"}
          </p>
        </div>

        {/* Order Notes */}
        <div className="summary-section">
          <h3>Order Notes (Optional)</h3>
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Any special instructions for your order..."
            rows="3"
            className="order-notes"
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderAddressForm();
      case 2:
        return renderPaymentForm();
      case 3:
        return renderConfirmationStep();
      default:
        return renderAddressForm();
    }
  };

  const renderStepButtons = () => (
    <div className="step-buttons">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handlePrevious}
          className="btn-secondary"
        >
          Previous
        </button>
      )}

      {currentStep === 1 && (
        <button
          type="submit"
          onClick={handleAddressSubmit}
          className="btn-primary"
        >
          Continue to Payment
        </button>
      )}

      {currentStep === 2 && (
        <button
          type="submit"
          onClick={handlePaymentSubmit}
          className="btn-primary"
        >
          Continue to Confirm
        </button>
      )}

      {currentStep === 3 && (
        <button
          type="submit"
          onClick={handleFinalSubmit}
          disabled={loading}
          className="btn-primary place-order-btn"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      )}
    </div>
  );

  return (
    <div className="checkout-page">
      <Header />
      <main className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          {renderStepIndicator()}
        </div>

        <div className="checkout-layout">
          <div className="checkout-content">
            {renderStepContent()}
            {renderStepButtons()}
          </div>

          <div className="checkout-sidebar">{renderOrderSummary()}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
