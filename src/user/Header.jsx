import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import cartService from "./cart/services/cartService";
import "./Header.css";

function Header() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Set current user in cart service for user-specific cart isolation
      if (currentUser) {
        cartService.setCurrentUser(currentUser.uid);
      } else {
        cartService.setCurrentUser(null);
      }
      // Update cart count after user change
      setCartCount(cartService.getCartItemCount());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCartCount = () => setCartCount(cartService.getCartItemCount());
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id) || document.querySelector(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollNav = (e, id) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollTo(id), 150);
    } else {
      scrollTo(id);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left: Logo */}
        <div className="header-left">
          <Link to="/" className="logo">
            <h2>SVGT</h2>{" "}
            {/* Shortened for better mobile fit, or use full text */}
            <span className="logo-full">SRI VIJAYA GANAPATHY TRADERS</span>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="nav-center">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" className="nav-link">
                Products
              </Link>
            </li>
            {user && (
              <li>
                <Link to="/orders" className="nav-link">
                  Orders
                </Link>
              </li>
            )}
            <li>
              <a
                href="#features"
                onClick={(e) => handleScrollNav(e, "features")}
                className="nav-link"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#footer"
                onClick={(e) => handleScrollNav(e, "footer")}
                className="nav-link"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="header-right">
          {/* Only show cart icon when user is signed in */}
          {user && (
            <Link to="/cart" className="cart-btn">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          <div className="auth-group">
            {user ? (
              <div className="user-box">
                <span className="user-name">{user.displayName || "User"}</span>
                <button onClick={() => signOut(auth)} className="logout-btn">
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn-login">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-signup">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
