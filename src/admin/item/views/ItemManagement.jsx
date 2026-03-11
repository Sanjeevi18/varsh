import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import itemController from "../controllers/itemController";
import "./ItemManagement.css";
import "../../Dashboard.css"; // Import Dashboard CSS for sidebar styling

const ItemManagement = () => {
  const { currentUser, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Fetching items from subcollection...");
      const result = await itemController.fetchItems();
      console.log("📊 Fetch result:", result);

      if (result.success) {
        console.log(
          "✅ Items fetched successfully:",
          result.data.length,
          "items",
        );
        setItems(result.data);
      } else {
        console.error("❌ Failed to fetch items:", result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error("❌ Fetch items error:", error);
      setError("Failed to fetch items: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const result = await itemController.deleteItem(itemId);
      if (result.success) {
        setItems(items.filter((item) => item.id !== itemId));
      } else {
        alert("Failed to delete item: " + result.error);
      }
    }
  };

  const filteredItems = items.filter((item) => {
    if (searchQuery === "") return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar / Nav Bar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Admin Panel</div>
        <nav className="nav-menu">
          <Link to="/admin" className="nav-item">
            Dashboard
          </Link>
          <Link to="/admin/items" className="nav-item active">
            Products
          </Link>
          <Link to="/admin/plumbers" className="nav-item">
            Plumbers
          </Link>
          <Link to="/admin/orders" className="nav-item">
            Orders
          </Link>
          <Link to="/admin/settings" className="nav-item">
            Settings
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        {/* Header Bar */}
        <header className="header-bar">
          <h2>Product Management</h2>
          <div className="header-profile">
            <span>{currentUser?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-container">
          <div className="item-management">
            <div className="filter-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="floating-add-btn"
              onClick={() => navigate("/admin/items/add")}
            >
              + Add
            </button>

            {loading ? (
              <div className="loading">Loading items...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="table-container">
                <table className="item-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Total Price</th>
                      <th>GST %</th>
                      <th>Profit</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="no-data">
                          No items found. Click "+ Add" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const totalPrice =
                          item.sellingPrice +
                          (item.sellingPrice * item.gstPercentage) / 100;
                        const profit =
                          item.sellingPrice - (item.purchasePrice || 0);
                        return (
                          <tr key={item.id}>
                            <td className="item-name">{item.name}</td>
                            <td>
                              <span className="category-badge">
                                {item.category}
                              </span>
                            </td>
                            <td>{item.stockQuantity}</td>
                            <td>₹{item.purchasePrice?.toFixed(2) || "0.00"}</td>
                            <td>₹{item.sellingPrice.toFixed(2)}</td>
                            <td className="total-price">
                              ₹{totalPrice.toFixed(2)}
                            </td>
                            <td>{item.gstPercentage}%</td>
                            <td
                              className={
                                profit >= 0
                                  ? "profit-positive"
                                  : "profit-negative"
                              }
                            >
                              ₹{profit.toFixed(2)}
                            </td>
                            <td>{formatDate(item.createdAt)}</td>
                            <td className="actions">
                              <button
                                className="btn-edit"
                                onClick={() =>
                                  navigate(`/admin/items/edit/${item.id}`)
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(item.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ItemManagement;
