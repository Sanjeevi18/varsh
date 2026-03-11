import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    id: 1,
    image: "/src/assets/facut.png",
    title: "Bathroom Fittings & Faucets",
    description: "Modern faucets, showers, and sensor-based accessories.",
  },
  {
    id: 2,
    image: "/src/assets/tap.jpg",
    title: "Hardware & Accessories",
    description: "Complete range of plumbing hardware and electronic fittings.",
  },
  {
    id: 3,
    image: "/src/assets/water tank.jpg",
    title: "Water Storage Tanks",
    description: "Durable tanks for residential and commercial use.",
  },
  {
    id: 4,
    image: "/src/assets/images/pvc pipes.jpg",
    title: "PVC & UPVC Pipes",
    description: "Quality pipes for water distribution systems.",
  },
];

function ImageSlider() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="fs-slider">
      {/* Slides Main Wrapper */}
      <div
        className="fs-wrapper"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="fs-slide">
            <img src={slide.image} alt={slide.title} className="fs-image" />
            <div className="fs-overlay">
              <div className="fs-content">
                <h1>{slide.title}</h1>
                <p>{slide.description}</p>
                <button onClick={() => navigate("/products")}>Shop Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button className="nav-btn left" onClick={prevSlide}>
        ❮
      </button>
      <button className="nav-btn right" onClick={nextSlide}>
        ❯
      </button>

      {/* Indicators */}
      <div className="fs-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`dot ${current === i ? "active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>

      <style jsx>{`
        .fs-slider {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #000;
          margin: 0;
          padding: 0;
          left: 0;
          right: 0;
        }

        .fs-wrapper {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fs-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
        }

        .fs-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .fs-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 20px;
        }

        .fs-content h1 {
          font-size: clamp(2rem, 8vw, 4rem);
          margin-bottom: 1rem;
          text-transform: uppercase;
        }

        .fs-content p {
          font-size: clamp(1rem, 3vw, 1.5rem);
          margin-bottom: 2rem;
          max-width: 800px;
        }

        .fs-content button {
          padding: 15px 40px;
          font-size: 1.2rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: 0.3s;
        }

        .fs-content button:hover {
          background: #2563eb;
          transform: scale(1.05);
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 20px;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10;
          transition: 0.3s;
        }

        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .left {
          left: 20px;
          border-radius: 0 10px 10px 0;
        }
        .right {
          right: 20px;
          border-radius: 10px 0 0 10px;
        }

        .fs-dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 15px;
        }

        .dot {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          cursor: pointer;
        }

        .dot.active {
          background: white;
          width: 30px;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .nav-btn {
            display: none;
          } /* Hide arrows on mobile for cleaner UI */
        }
      `}</style>
    </div>
  );
}

export default ImageSlider;
