import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductController from "../controllers/productController";
import Header from "../../Header";
import Footer from "../../Footer";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allProducts, handleAddToCart, loading } = useProductController();

  const product = useMemo(() => {
    return allProducts.find((p) => p.id === id);
  }, [id, allProducts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="page-loader">Loading...</div>;
  if (!product) return <div className="page-loader">Product not found.</div>;

  return (
    <div className="detail-page">
      <Header />
      <div className="detail-wrapper">
        <button className="back-btn" onClick={() => navigate("/products")}>
          ← Back to Shop
        </button>

        <div className="main-info">
          <div className="product-visual">
            <img src={product.getMainImage()} alt={product.name} />
          </div>

          <div className="product-specs">
            <div className="specs-header">
              <span className="category-tag">{product.category}</span>
              <span
                className={`stock-status ${product.stockQuantity > 0 ? "in" : "out"}`}
              >
                {product.stockQuantity > 0
                  ? `In Stock (${product.stockQuantity})`
                  : "Out of Stock"}
              </span>
            </div>

            <h1>{product.name}</h1>

            <div className="pricing-box">
              <p className="price-tag">₹{product.sellingPrice}</p>
              <span className="gst-info">
                Inclusive of {product.gstPercentage}% GST
              </span>
            </div>

            <div className="admin-insights">
              <div className="insight-item">
                <label>Stock Available</label>
                <span>{product.stockQuantity} Units</span>
              </div>
              <div className="insight-item">
                <label>Category</label>
                <span>{product.category}</span>
              </div>
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p className="desc">
                {product.description ||
                  "No description provided for this item."}
              </p>
            </div>

            <div className="action-row">
              <button
                className="main-add-btn"
                disabled={product.stockQuantity <= 0}
                onClick={() => handleAddToCart(product, 1)}
              >
                {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* DISPLAY ALL OTHER PRODUCTS BELOW */}
        <section className="all-products-section">
          <h2 className="section-title">Explore More Products</h2>
          <div className="full-product-grid">
            {allProducts
              .filter((p) => p.id !== product.id)
              .map((item) => (
                <div
                  key={item.id}
                  className="explore-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="card-img-hold">
                    <img src={item.getMainImage()} alt={item.name} />
                  </div>
                  <div className="card-details">
                    <h4>{item.name}</h4>
                    <div className="card-footer">
                      <span className="card-price">₹{item.sellingPrice}</span>
                      <span className="card-stock">
                        {item.stockQuantity} Left
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
