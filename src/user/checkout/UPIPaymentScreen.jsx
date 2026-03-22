import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useOrderController from "../order/controllers/orderController";
import Order from "../order/models/UserOrder";
import "./UPIPaymentScreen.css";

const PaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { createOrder } = useOrderController();

  const [view, setView] = useState("bill");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const { checkoutData, cartItems } = location.state || {};

  const calculateTotal = () => {
    const itemsTotal =
      cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0;
    const plumberFee = checkoutData?.plumberService?.serviceFee || 0;
    return itemsTotal + plumberFee;
  };

  const totalAmount = calculateTotal();
  const totalItems =
    cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const cartSummary = {
    totalAmount,
    totalItems,
  };

  // Redirect if data is missing
  useEffect(() => {
    if (!checkoutData || !cartItems) {
      navigate("/user/checkout");
    }
  }, [checkoutData, cartItems, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);

  // Get UPI ID from environment variable for security
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const initializeRazorpayPayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh and try again.");
      return;
    }

    setProcessing(true);

    const options = {
      key: razorpayKeyId,
      amount: Math.round(cartSummary?.totalAmount * 100), // Amount in paise
      currency: "INR",
      name: "SVGT",
      description: "Order Payment",
      prefill: {
        name:
          user?.displayName ||
          checkoutData?.personalInfo?.fullName ||
          "Customer",
        email: user?.email || checkoutData?.personalInfo?.email || "",
        contact: checkoutData?.personalInfo?.phone || "",
      },
      method: {
        upi: selectedPaymentMethod === "upi",
        card: selectedPaymentMethod === "card",
        netbanking: false,
        wallet: false,
      },
      theme: {
        color: "#10b981",
      },
      handler: async (response) => {
        await handlePaymentSuccess(response);
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
          alert("Payment cancelled. Please try again.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      const order = Order.fromCheckoutData(checkoutData, cartItems, user?.uid);
      order.paymentStatus = "paid";
      order.paymentMethod = selectedPaymentMethod === "upi" ? "UPI" : "Card";
      order.paymentId = paymentResponse.razorpay_payment_id;

      const result = await createOrder(order.toFirestore());

      if (result.success) {
        setPaymentDone(true);
        setProcessing(false);
        localStorage.removeItem("seagull-cart");
        window.dispatchEvent(new Event("cartUpdated"));

        setTimeout(() => {
          navigate("/user/products", { replace: true });
        }, 3000); // Show success message for 3 seconds
      } else {
        alert(result.error || "Order creation failed.");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment processing failed. Please try again.");
      setProcessing(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div className="payment-page-wrapper">
      <div className="payment-modal">
        <div className="checkout-steps">
          <div className="step-item completed">Shipping</div>
          <div className="step-divider active"></div>
          <div className="step-item active">Payment</div>
          <div className="step-divider"></div>
          <div className="step-item">Review</div>
        </div>

        {view === "bill" ? (
          <div className="bill-view fade-in">
            <div className="payment-header">
              <h2>Invoice Summary</h2>
              <p>Please review your order details</p>
            </div>

            <div className="invoice-box">
              <div className="invoice-row">
                <span>Merchant</span>
                <span className="text-dark">SVGT</span>
              </div>
              <div className="invoice-row">
                <span>Items ({cartSummary.totalItems})</span>
                <span className="text-dark">
                  {formatCurrency(cartSummary.totalAmount)}
                </span>
              </div>
              <div className="invoice-divider"></div>
              <div className="invoice-row total">
                <span>Total Amount</span>
                <span className="amount-highlight">
                  {formatCurrency(cartSummary.totalAmount)}
                </span>
              </div>
            </div>

            <button className="btn-pay-next" onClick={() => setView("payment")}>
              Choose Payment Method
            </button>
            <button
              className="btn-back-link"
              onClick={() => navigate("/user/checkout")}
            >
              Back to Shipping
            </button>
          </div>
        ) : paymentDone ? (
          <div className="qr-view fade-in">
            <div className="qr-header-info">
              <div
                className="timer-pill"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                ✅
              </div>
              <h3>Order Confirmed!</h3>
              <p>Payment successful. Redirecting to products...</p>
            </div>
            <div className="payment-confirmation-details">
              <p className="p-merchant">
                Amount Paid:{" "}
                <strong>{formatCurrency(cartSummary.totalAmount)}</strong>
              </p>
              <p className="p-amount">
                {selectedPaymentMethod === "upi" ? "UPI" : "Card"}
              </p>
            </div>
          </div>
        ) : processing ? (
          <div className="qr-view fade-in">
            <div className="qr-header-info">
              <div className="timer-pill">⏳</div>
              <h3>Processing Payment...</h3>
              <p>Please wait while we confirm your transaction</p>
            </div>
          </div>
        ) : (
          <div className="qr-view fade-in">
            <div className="payment-header">
              <h2>Select Payment Method</h2>
              <p>
                Choose your preferred payment option for{" "}
                {formatCurrency(cartSummary.totalAmount)}
              </p>
            </div>

            <div className="payment-methods" style={{ marginBottom: "2rem" }}>
              <div
                className={`payment-option ${selectedPaymentMethod === "upi" ? "selected" : ""}`}
                onClick={() => setSelectedPaymentMethod("upi")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  border:
                    selectedPaymentMethod === "upi"
                      ? "2px solid #4f46e5"
                      : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  className="payment-icon"
                  style={{ fontSize: "2rem", marginRight: "1rem" }}
                >
                  📱
                </div>
                <div className="payment-details" style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>UPI Payment</h3>
                  <p style={{ margin: 0, color: "#64748b" }}>
                    Pay using PhonePe, GPay, Paytm & more
                  </p>
                </div>
                <div
                  className="payment-radio"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid #4f46e5",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPaymentMethod === "upi" && (
                    <div
                      className="selected-dot"
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#4f46e5",
                      }}
                    ></div>
                  )}
                </div>
              </div>

              <div
                className={`payment-option ${selectedPaymentMethod === "card" ? "selected" : ""}`}
                onClick={() => setSelectedPaymentMethod("card")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  border:
                    selectedPaymentMethod === "card"
                      ? "2px solid #4f46e5"
                      : "1px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginTop: "1rem",
                }}
              >
                <div
                  className="payment-icon"
                  style={{ fontSize: "2rem", marginRight: "1rem" }}
                >
                  💳
                </div>
                <div className="payment-details" style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>Card Payment</h3>
                  <p style={{ margin: 0, color: "#64748b" }}>
                    Credit/Debit Cards (Visa, Mastercard, etc.)
                  </p>
                </div>
                <div
                  className="payment-radio"
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid #4f46e5",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPaymentMethod === "card" && (
                    <div
                      className="selected-dot"
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#4f46e5",
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>

            <div className="action-footer">
              <button
                className="btn-pay-next"
                onClick={initializeRazorpayPayment}
                disabled={processing || paymentDone}
              >
                Pay {formatCurrency(cartSummary.totalAmount)}
              </button>
              <button
                className="btn-cancel-text"
                onClick={() => setView("bill")}
              >
                Back to Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentScreen;
