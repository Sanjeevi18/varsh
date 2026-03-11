import React from "react";
import { useNavigate } from "react-router-dom";
import useProductController from "../controllers/productController";
import Header from "../../Header";
import Footer from "../../Footer";
import "./ProductShop.css";

const ProductShop = () => {
  const navigate = useNavigate();
  const {
    products,
    loading,
    searchTerm,
    selectedCategory,
    categories,
    handleSearch,
    handleCategoryFilter,
  } = useProductController();

  // Helper to determine stock status
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { label: "Out of Stock", class: "out" };
    if (quantity <= 5) return { label: `Only ${quantity} left`, class: "low" };
    return { label: "In Stock", class: "available" };
  };

  return (
    <div className="product-page">
      <Header />

      <main className="shop-container">
        <header className="shop-header">
          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="shop-search"
            />
          </div>

          <nav className="filter-nav">
            <button
              className={selectedCategory === "all" ? "tab active" : "tab"}
              onClick={() => handleCategoryFilter("all")}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={selectedCategory === cat ? "tab active" : "tab"}
                onClick={() => handleCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>
        </header>

        <section className="inventory-section">
          <div className="inventory-stats">
            <h2>
              {selectedCategory === "all" ? "Inventory" : selectedCategory}
            </h2>
            <p>{products.length} Items listed</p>
          </div>

          {loading ? (
            <div className="loading-shimmer">Loading collection...</div>
          ) : (
            <div className="product-grid">
              {products.map((product) => {
                const stock = getStockStatus(product.stockQuantity);
                return (
                  <div
                    key={product.id}
                    className="item-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="item-media">
                      <img
                        src={product.images?.[0]?.url || "placeholder.png"}
                        alt={product.name}
                      />
                      <span className={`stock-badge ${stock.class}`}>
                        {stock.label}
                      </span>
                    </div>

                    <div className="item-body">
                      <div className="item-header">
                        <span className="item-cat">{product.category}</span>
                        <h3 className="item-name">{product.name}</h3>
                      </div>

                      <div className="item-footer">
                        <div className="pricing">
                          <span className="price-main">
                            ₹{product.sellingPrice}
                          </span>
                          <span className="gst-label">
                            +{product.gstPercentage}% GST
                          </span>
                        </div>
                        <div className="stock-count">
                          <strong>{product.stockQuantity}</strong> units
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductShop;
