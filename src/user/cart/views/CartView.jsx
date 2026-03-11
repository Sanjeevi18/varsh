import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartController from "../controllers/cartController";
import Header from "../../Header";
import Footer from "../../Footer";
// Import the public plumber service for users
import publicPlumberService from "../services/publicPlumberService";
import "./CartView.css";

const CartView = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    handleRemoveItem,
    getCartSummary,
    increaseQuantity,
    decreaseQuantity,
    // handleCheckout,
  } = useCartController();

  const [needsPlumber, setNeedsPlumber] = useState(false);
  const [availablePlumbers, setAvailablePlumbers] = useState([]);
  const [selectedPlumberId, setSelectedPlumberId] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTime, setServiceTime] = useState("");
  const [plumbersLoading, setPlumbersLoading] = useState(false);
  const [plumbersError, setPlumbersError] = useState(null);

  // Function to fetch plumbers
  const fetchPlumbers = async () => {
    try {
      setPlumbersLoading(true);
      setPlumbersError(null);
      console.log("🔄 Starting to fetch plumbers...");

      // Add a small delay to ensure Firebase auth is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = await publicPlumberService.getAllAvailablePlumbers();
      console.log("✅ Fetched plumbers in cart:", data); // Debug log

      if (data && data.length > 0) {
        setAvailablePlumbers(data);
        console.log("🎉 Successfully loaded plumbers:", data.length);
      } else {
        setAvailablePlumbers([]);
        console.log("⚠️ No plumbers returned from service");
      }
    } catch (error) {
      console.error("❌ Error fetching plumbers:", error);
      let errorMessage = "Failed to load plumbers";

      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please try signing in again.";
      } else if (error.message) {
        errorMessage = "Failed to load plumbers: " + error.message;
      }

      setPlumbersError(errorMessage);
      setAvailablePlumbers([]);
    } finally {
      setPlumbersLoading(false);
    }
  };

  // Load plumbers that admin added
  useEffect(() => {
    // Only fetch if user is present (for authentication)
    fetchPlumbers();
  }, []);

  const cartSummary = getCartSummary();

  const onProceed = () => {
    if (needsPlumber && (!selectedPlumberId || !serviceDate || !serviceTime)) {
      alert("Please select a plumber, date, and time for the service.");
      return;
    }

    // Prepare plumber service data if needed
    const plumberService =
      needsPlumber && selectedPlumberId
        ? {
            plumberId: selectedPlumberId,
            date: serviceDate,
            time: serviceTime,
            datetime: `${serviceDate} ${serviceTime}`,
            name: availablePlumbers.find((p) => p.id === selectedPlumberId)
              ?.name,
            phone: availablePlumbers.find((p) => p.id === selectedPlumberId)
              ?.phone,
            area: availablePlumbers.find((p) => p.id === selectedPlumberId)
              ?.area,
            city: availablePlumbers.find((p) => p.id === selectedPlumberId)
              ?.city,
            hourlyRate: availablePlumbers.find(
              (p) => p.id === selectedPlumberId,
            )?.hourlyRate,
            experience: availablePlumbers.find(
              (p) => p.id === selectedPlumberId,
            )?.experience,
            specialization: availablePlumbers.find(
              (p) => p.id === selectedPlumberId,
            )?.specialization,
            serviceFee:
              availablePlumbers.find((p) => p.id === selectedPlumberId)
                ?.hourlyRate * 2, // 2 hours minimum
          }
        : null;

    // Navigate to checkout page with data
    navigate("/checkout", {
      state: {
        cartItems,
        needsPlumber,
        plumberService,
      },
    });
  };

  if (loading) return <div className="loader">Loading your cart...</div>;

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-container">
        <h1 className="cart-title">Your Shopping Cart</h1>

        <div className="cart-layout">
          {/* LEFT: Product List */}
          <div className="cart-items-list">
            {cartItems.length === 0 ? (
              <div className="empty-state">Your cart is empty</div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img src={item.image} alt={item.name} className="item-img" />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{item.price}</p>
                    <div className="qty-controls">
                      <button onClick={() => decreaseQuantity(item.id)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQuantity(item.id)}>
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* RIGHT: Summary & Plumber Selection */}
          <aside className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartSummary.totalAmount}</span>
              </div>

              {/* PLUMBER SECTION */}
              <div className="plumber-option-box">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={needsPlumber}
                    onChange={(e) => setNeedsPlumber(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Do you need a Plumber?
                </label>

                {needsPlumber && (
                  <div className="plumber-selection-area animate-fade-in">
                    <div className="input-group">
                      <label>Select Professional</label>
                      {plumbersLoading ? (
                        <div className="plumbers-loading">
                          Loading plumbers...
                        </div>
                      ) : plumbersError ? (
                        <div className="plumbers-error">
                          {plumbersError}
                          <button
                            onClick={fetchPlumbers}
                            style={{
                              display: "block",
                              marginTop: "10px",
                              padding: "5px 10px",
                              backgroundColor: "#3182ce",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                            disabled={plumbersLoading}
                          >
                            {plumbersLoading ? "Retrying..." : "🔄 Retry"}
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="plumbers-count-info">
                            {availablePlumbers.length > 0 ? (
                              <small
                                style={{ color: "#059669", fontSize: "0.8rem" }}
                              >
                                ✅ {availablePlumbers.length} plumber(s)
                                available
                              </small>
                            ) : (
                              <small
                                style={{ color: "#dc2626", fontSize: "0.8rem" }}
                              >
                                ⚠️ No plumbers found in database
                              </small>
                            )}
                          </div>
                          <select
                            value={selectedPlumberId}
                            onChange={(e) =>
                              setSelectedPlumberId(e.target.value)
                            }
                          >
                            <option value="">-- Choose a Plumber --</option>
                            {availablePlumbers.length > 0 ? (
                              availablePlumbers.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} | {p.area}, {p.city} | ₹
                                  {p.hourlyRate}
                                  /hr | {p.experience}yr exp | {p.phone}
                                </option>
                              ))
                            ) : (
                              <option disabled>
                                No plumbers available (
                                {availablePlumbers.length} found)
                              </option>
                            )}
                          </select>
                        </>
                      )}

                      {/* Display selected plumber details */}
                      {selectedPlumberId && (
                        <div className="selected-plumber-details">
                          {(() => {
                            const selectedPlumber = availablePlumbers.find(
                              (p) => p.id === selectedPlumberId,
                            );
                            return selectedPlumber ? (
                              <div className="plumber-info-card">
                                <h4>Selected Plumber Details:</h4>
                                <p>
                                  <strong>Name:</strong> {selectedPlumber.name}
                                </p>
                                <p>
                                  <strong>Phone:</strong>{" "}
                                  {selectedPlumber.phone}
                                </p>
                                <p>
                                  <strong>Area:</strong> {selectedPlumber.area},{" "}
                                  {selectedPlumber.city}
                                </p>
                                <p>
                                  <strong>Experience:</strong>{" "}
                                  {selectedPlumber.experience} years
                                </p>
                                <p>
                                  <strong>Rate:</strong> ₹
                                  {selectedPlumber.hourlyRate}/hour
                                </p>
                                <p>
                                  <strong>Specialization:</strong>{" "}
                                  {selectedPlumber.specialization}
                                </p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Service Date</label>
                      <input
                        type="date"
                        value={serviceDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setServiceDate(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label>Service Time</label>
                      <select
                        value={serviceTime}
                        onChange={(e) => setServiceTime(e.target.value)}
                        disabled={!serviceDate}
                      >
                        <option value="">-- Select Time --</option>
                        <option value="08:00">8:00 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                      </select>
                      {!serviceDate && (
                        <small style={{ color: "#666", fontSize: "0.8rem" }}>
                          Please select a date first
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{cartSummary.totalAmount}</span>
              </div>

              <button
                className="checkout-btn"
                disabled={cartItems.length === 0}
                onClick={onProceed}
              >
                Proceed to Checkout
              </button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartView;
