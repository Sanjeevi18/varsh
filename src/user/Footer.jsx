import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              Sri Vijaya Ganapathy Traders is a leading supplier of quality
              products and services. We are committed to providing our customers
              with the best products at competitive prices, ensuring reliability
              and excellence in every transaction.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+91 7094822710</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>srivgtraders@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>90, KRK complex, elakkadai - 638109</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Sri Vijaya Ganapathy Traders. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        /* Footer Styles */
        .footer {
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          color: white;
          padding: 60px 0 20px;
          margin-top: 80px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .footer-section h3 {
          color: #ecf0f1;
          margin-bottom: 20px;
          font-size: 1.2rem;
          font-weight: 600;
          border-bottom: 2px solid #3498db;
          padding-bottom: 8px;
          display: inline-block;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 5px;
        }

        .footer-section ul li a {
          color: #bdc3c7;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-section ul li a:hover {
          color: #3498db;
        }

        .footer-section p {
          color: #bdc3c7;
          line-height: 1.6;
          margin: 0;
          text-align: justify;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #bdc3c7;
        }

        .contact-icon {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
        }

        .footer-bottom {
          text-align: center;
          padding: 30px 20px 20px;
          border-top: 1px solid #34495e;
          margin-top: 40px;
        }

        .footer-bottom p {
          color: #95a5a6;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Footer Responsive Styles */
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }

          .footer {
            padding: 40px 0 20px;
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .contact-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </>
  );
}

export default Footer;
