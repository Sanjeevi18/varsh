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

  // Get passed data from cart
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

  // Check if cart is empty
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Redirecting to products.");
      navigate("/products");
    }
  }, [cartItems, navigate]);

  // Calculate order summary
  const cartSummary = getCartSummary();
  const plumberServiceFee =
    needsPlumber && plumberService ? Number(plumberService.serviceFee) : 0;
  const finalTotal = cartSummary.totalAmount + plumberServiceFee;

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
    if (validateAddress()) handleNext();
    else alert("Please fill all required fields.");
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to place your order.");
      return;
    }

    setLoading(true);
    try {
      const orderDetails = {
        customerNotes: orderNotes,
        deliveryAddress: addressData,
        paymentMethod: paymentMethod,
        plumberService: needsPlumber ? plumberService : null,
        totalPaid: finalTotal,
      };

      const result = await handleCheckout(orderDetails);

      if (result.success) {
        const generatedOrderId = result.order?.id || `ORD${Date.now()}`;

        if (paymentMethod === "upi") {
          // Navigate to UPI payment screen with order data
          navigate("/user/payment/upi", {
            state: {
              checkoutData: orderDetails,
              cartItems: cartItems,
              cartSummary: getCartSummary(),
              orderId: generatedOrderId,
            },
          });
        } else {
          alert(`Order placed successfully! Order ID: ${generatedOrderId}`);
          navigate("/products", {
            state: {
              message: "Order placed successfully!",
              orderId: generatedOrderId,
            },
          });
        }
      } else {
        alert("Failed to process order: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      alert("Error processing order: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS ---

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
            rows="2"
            required
          />
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="City *"
            value={addressData.city}
            onChange={(e) =>
              setAddressData({ ...addressData, city: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="State *"
            value={addressData.state}
            onChange={(e) =>
              setAddressData({ ...addressData, state: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Pincode *"
            value={addressData.pincode}
            onChange={(e) =>
              setAddressData({ ...addressData, pincode: e.target.value })
            }
            required
          />
        </div>
      </form>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="checkout-step payment-step">
      <h2>Select Payment Method</h2>
      <div className="payment-options">
        {["cod", "upi", "card"].map((method) => (
          <label
            key={method}
            className={`payment-option ${paymentMethod === method ? "selected" : ""}`}
          >
            <input
              type="radio"
              value={method}
              checked={paymentMethod === method}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <div className="option-content">
              <span className="option-icon">
                {method === "cod" ? "💰" : method === "upi" ? "📱" : "💳"}
              </span>
              <div>
                <h3>
                  {method === "cod"
                    ? "Cash on Delivery"
                    : method === "upi"
                      ? "UPI Payment"
                      : "Credit/Debit Card"}
                </h3>
                <p>
                  {method === "cod"
                    ? "Pay at your doorstep"
                    : "Instant & Secure"}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="checkout-step confirmation-step">
      <h2>Review Your Order</h2>
      <div className="confirmation-grid">
        <div className="conf-box">
          <h4>Delivery To:</h4>
          <p>
            <strong>{addressData.fullName}</strong>
          </p>
          <p>
            {addressData.address}, {addressData.city}
          </p>
          <p>Phone: {addressData.phone}</p>
        </div>
        <div className="conf-box">
          <h4>Payment Method:</h4>
          <p>{paymentMethod.toUpperCase()}</p>
        </div>
      </div>
      <div className="form-group" style={{ marginTop: "20px" }}>
        <label>Special Instructions (Optional)</label>
        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="e.g. Please call before delivery..."
          rows="2"
        />
      </div>
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
            {currentStep === 1 && renderAddressForm()}
            {currentStep === 2 && renderPaymentForm()}
            {currentStep === 3 && renderConfirmationStep()}

            <div className="step-buttons">
              {currentStep > 1 && (
                <button className="btn-secondary" onClick={handlePrevious}>
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  className="btn-primary"
                  onClick={
                    currentStep === 1
                      ? handleAddressSubmit
                      : handlePaymentSubmit
                  }
                >
                  Continue
                </button>
              ) : (
                <button
                  className="btn-primary place-order-btn"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : paymentMethod === "upi"
                      ? "Confirm & Pay"
                      : "Place Order"}
                </button>
              )}
            </div>
          </div>

          <aside className="checkout-sidebar">
            <div className="order-summary-section">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems?.map((item, i) => (
                  <div key={i} className="summary-item">
                    <span>
                      {item.name} (x{item.quantity})
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {needsPlumber && (
                  <div className="summary-item service">
                    <span>Plumber Fee</span>
                    <span>₹{plumberServiceFee}</span>
                  </div>
                )}
              </div>
              <div className="final-total-row">
                <span>Grand Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
