import { useState, useEffect } from "react";
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
    await logout();
    navigate("/signin");
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [itemsResult, ordersResult, plumbersResult] = await Promise.all([
        itemController.fetchItems(),
        orderController.fetchOrders(currentUser.uid),
        plumberController.fetchPlumbers(),
      ]);

      // Process items data
      const totalProducts = itemsResult.success ? itemsResult.data.length : 0;

      // Process orders data
      const totalOrders = ordersResult.success ? ordersResult.orders.length : 0;
      const recentOrders = ordersResult.success
        ? ordersResult.orders
            .slice(0, 5) // Get latest 5 orders
            .map((order) => ({
              id: order.id,
              date: order.orderDate || order.createdAt,
              type: "Order",
              description: `${order.orderNumber} - ${order.customerInfo?.name || "Customer"}`,
              amount: order.totalAmount || 0,
              status: order.status || "Pending",
            }))
        : [];

      // Process plumbers data
      const totalPlumbers = plumbersResult.success
        ? plumbersResult.data.length
        : 0;
      const activePlumbers = plumbersResult.success
        ? plumbersResult.data.filter((p) => p.isActive).length
        : 0;

      // Update states
      setStats({
        totalProducts,
        totalOrders,
        totalPlumbers,
        activePlumbers,
      });

      setRecentActivities(recentOrders);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar / Nav Bar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Admin Panel</div>
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
          {/* <Link to="/admin/settings" className="nav-item">
            Settings
          </Link> */}
        </nav>
      </aside>

      <div className="main-content">
        {/* Header Bar */}
        <header className="header-bar">
          <h2>Dashboard Overview</h2>
          <div className="header-profile">
            <span>{currentUser?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-container">
          {loading ? (
            <div className="loading-spinner">Loading Data...</div>
          ) : (
            <>
              {/* Stats Grid with Real Data */}
              <div className="dashboard-grid">
                <div className="stat-card purple">
                  <h3>{stats.totalProducts}</h3>
                  <p>Total Products</p>
                </div>
                <div className="stat-card orange">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-card blue">
                  <h3>{stats.totalPlumbers}</h3>
                  <p>Total Plumbers</p>
                </div>
                <div className="stat-card green">
                  <h3>{stats.activePlumbers}</h3>
                  <p>Active Plumbers</p>
                </div>
              </div>

              <div className="activities-section">
                <h2 className="section-title">Recent Orders</h2>
                <div className="table-container">
                  <table className="activities-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivities.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="no-data">
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        recentActivities.map((activity, index) => (
                          <tr
                            key={index}
                            className="activity-row"
                            onClick={() =>
                              navigate(`/admin/orders/${activity.id}`)
                            }
                          >
                            <td>
                              {activity.date &&
                                new Date(
                                  activity.date.toDate
                                    ? activity.date.toDate()
                                    : activity.date,
                                ).toLocaleDateString("en-IN")}
                            </td>
                            <td>{activity.type}</td>
                            <td>{activity.description}</td>
                            <td>₹{activity.amount.toLocaleString("en-IN")}</td>
                            <td>
                              <span
                                className={`status-badge ${activity.status?.toLowerCase()}`}
                              >
                                {activity.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
