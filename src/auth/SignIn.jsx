import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect information from location state
  const message = location.state?.message;
  const from = location.state?.from || "/";

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const user = userCredential.user;

      // Check if user is admin
      const isAdmin = await checkAdminRole(user);

      // Force a small delay to ensure Firebase auth state is set
      setTimeout(() => {
        if (isAdmin) {
          navigate("/admin");
        } else {
          // Redirect to the original page they were trying to access
          navigate(from, { replace: true });
        }
      }, 100);
    } catch (error) {
      setError(error.message);
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdminRole = async (user) => {
    try {
      // Query the Admin collection using correct field name 'email'
      const adminQuery = query(
        collection(db, "Admin"),
        where("email", "==", user.email),
        where("role", "==", "admin"),
      );

      const adminSnapshot = await getDocs(adminQuery);

      // If document exists in Admin collection with role 'admin', user is admin
      if (!adminSnapshot.empty) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };

  return (
    <div className="auth-container">
      {/* 3D Decorative Elements */}
      <div className="decoration cube-1"></div>
      <div className="decoration sphere"></div>
      <div className="decoration cube-2"></div>
      <div className="decoration cube-3"></div>

      <div className="auth-card">
        <h1>Sign In</h1>

        {message && (
          <div
            className="info-message"
            style={{
              color: "#3182ce",
              marginBottom: "1rem",
              textAlign: "center",
              backgroundColor: "#ebf8ff",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid #bee3f8",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}
          >
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="remember-forgot">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="#" className="forgot-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
