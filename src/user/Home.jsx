import React from "react";
import Header from "./Header";
import ImageSlider from "./ImageSlider";
import Footer from "./Footer";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <ImageSlider />
        </section>

        <section id="features" className="features-section">
          <div className="container">
            <h2 className="section-title">
              Why Choose Sri Vijaya Ganapathy Traders?
            </h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Quality Products</h3>
                <p>
                  Premium hardware and plumbing materials for lasting
                  durability.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Fast Delivery</h3>
                <p>
                  Quick and reliable delivery to your doorstep across the
                  region.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Expert Advice</h3>
                <p>
                  Professional guidance to help you choose the right materials.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
