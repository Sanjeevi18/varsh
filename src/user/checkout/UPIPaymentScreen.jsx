import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./UPIPaymentScreen.css";

const UPIPaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState("bill");
  const [timeLeft, setTimeLeft] = useState(300);

  const { checkoutData, cartItems } = location.state || {};

  // Calculate total amount properly
  const calculateTotal = () => {
    const itemsTotal =
      cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0;
    const plumberFee = checkoutData?.plumberService?.serviceFee || 0;
    return itemsTotal + plumberFee;
  };

  const totalAmount = calculateTotal();
  const itemCount =
    cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Redirect if data is missing
  useEffect(() => {
    if (!checkoutData || !cartItems) {
      navigate("/user/checkout");
    }
  }, [checkoutData, cartItems, navigate]);

  // Timer Logic
  useEffect(() => {
    let timer;
    if (view === "qr" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            alert("Payment session expired.");
            setView("bill");
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const upiString = `upi://pay?pa=seagullsports@upi&pn=SEAGULL%20SPORTS&am=${totalAmount}&cu=INR&tn=Order%20Payment`;

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
                <span className="text-dark">SEAGULL SPORTS</span>
              </div>
              <div className="invoice-row">
                <span>Items ({itemCount})</span>
                <span className="text-dark">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="invoice-divider"></div>
              <div className="invoice-row total">
                <span>Total Amount</span>
                <span className="amount-highlight">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <button
              className="btn-pay-next"
              onClick={() => {
                setView("qr");
                setTimeLeft(300);
              }}
            >
              Continue to UPI Payment
            </button>
            <button
              className="btn-back-link"
              onClick={() => navigate("/user/checkout")}
            >
              Back to Shipping
            </button>
          </div>
        ) : (
          <div className="qr-view fade-in">
            <div className="qr-header-info">
              <div className="timer-pill">
                Expires in {formatTime(timeLeft)}
              </div>
              <h3>Scan UPI QR Code</h3>
            </div>

            <div className="qr-display-card">
              <QRCodeSVG value={upiString} size={180} level="M" />
            </div>

            <div className="payment-confirmation-details">
              <p className="p-merchant">
                Paying to: <strong>SEAGULL SPORTS</strong>
              </p>
              <p className="p-amount">{formatCurrency(totalAmount)}</p>
            </div>

            <div className="action-footer">
              <button
                className="btn-cancel-text"
                onClick={() => setView("bill")}
              >
                Cancel and Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UPIPaymentScreen;
