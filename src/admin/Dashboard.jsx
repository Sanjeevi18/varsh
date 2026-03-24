import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import itemController from "./item/controllers/itemController";
import plumberController from "./plumber/controllers/plumberController";
import * as orderController from "./order/controllers/orderController";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalPlumbers: 0,
    activePlumbers: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsResult, ordersResult, plumbersResult] = await Promise.all([
        itemController.fetchItems(),
        orderController.fetchOrders(currentUser.uid),
        plumberController.fetchPlumbers(),
      ]);

      const totalProducts = itemsResult.success ? itemsResult.data.length : 0;
      const totalOrders = ordersResult.success ? ordersResult.orders.length : 0;

      const recentOrders = ordersResult.success
        ? ordersResult.orders.slice(0, 5).map((order) => ({
            id: order.id,
            date: order.orderDate || order.createdAt,
            orderNo: order.orderNumber || "N/A",
            customer: order.customerInfo?.name || "Guest Customer",
            amount: order.totalAmount || 0,
            status: order.status || "Pending",
          }))
        : [];

      const totalPlumbers = plumbersResult.success
        ? plumbersResult.data.length
        : 0;
      const activePlumbers = plumbersResult.success
        ? plumbersResult.data.filter((p) => p.isActive).length
        : 0;

      setStats({ totalProducts, totalOrders, totalPlumbers, activePlumbers });
      setRecentActivities(recentOrders);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">ADMIN PORTAL</div>
        <nav className="nav-menu">
          <Link to="/admin" className="nav-item active">
            Dashboard
          </Link>
          <Link to="/admin/items" className="nav-item">
            Products
          </Link>
          <Link to="/admin/plumbers" className="nav-item">
            Plumbers
          </Link>
          <Link to="/admin/orders" className="nav-item">
            Orders
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="top-navbar">
          <div className="navbar-left">
            <h1 className="navbar-title">ADMIN DASHBOARD</h1>
          </div>
          <div className="navbar-right">
            <span className="user-email">{currentUser?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-content">
            {loading ? (
              <div className="loading-spinner">Fetching latest records...</div>
            ) : (
              <>
                <section className="stats-section">
                  <h2 className="section-header">Overview</h2>
                  <div className="stats-grid">
                    <div className="stat-card stat-products">
                      <div className="stat-icon">📦</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{stats.totalProducts}</h3>
                        <p className="stat-label">Total Products</p>
                      </div>
                    </div>
                    <div className="stat-card stat-orders">
                      <div className="stat-icon">🛒</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{stats.totalOrders}</h3>
                        <p className="stat-label">Total Orders</p>
                      </div>
                    </div>
                    <div className="stat-card stat-plumbers">
                      <div className="stat-icon">👷</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{stats.totalPlumbers}</h3>
                        <p className="stat-label">Total Plumbers</p>
                      </div>
                    </div>
                    <div className="stat-card stat-active">
                      <div className="stat-icon">✓</div>
                      <div className="stat-info">
                        <h3 className="stat-value">{stats.activePlumbers}</h3>
                        <p className="stat-label">Active Now</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="orders-section">
                  <div className="section-header-bar">
                    <h2 className="section-title">Recent Orders</h2>
                    <Link to="/admin/orders" className="view-all-link">
                      View All
                    </Link>
                  </div>
                  <div className="table-wrapper">
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-state">
                              No recent orders found.
                            </td>
                          </tr>
                        ) : (
                          recentActivities.map((order) => (
                            <tr key={order.id} className="order-row">
                              <td className="date-cell">
                                {formatDate(order.date)}
                              </td>
                              <td className="order-no">{order.orderNo}</td>
                              <td className="customer-cell">
                                {order.customer}
                              </td>
                              <td className="amount-cell">
                                ₹{order.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="status-cell">
                                <span
                                  className={`status-badge status-${order.status.toLowerCase()}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="action-cell">
                                <button
                                  onClick={() =>
                                    navigate(`/admin/orders/${order.id}`)
                                  }
                                  className="action-btn"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
