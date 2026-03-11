import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import plumberController from "../controllers/plumberController";
import "./PlumberManagement.css";
import "../../Dashboard.css"; // Import Dashboard CSS for sidebar styling

const PlumberManagement = () => {
  const { currentUser, logout } = useAuth();
  const [plumbers, setPlumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  useEffect(() => {
    console.log("🔍 PlumberManagement useEffect - currentUser:", currentUser);
    console.log(
      "🔍 PlumberManagement useEffect - currentUser.uid:",
      currentUser?.uid,
    );
    fetchPlumbers();
  }, []);

  const fetchPlumbers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Fetching plumbers from subcollection...");
      console.log("🔍 Current user in component:", currentUser);
      console.log("🔍 Current user UID in component:", currentUser?.uid);

      const result = await plumberController.fetchPlumbers();
      console.log("📊 Fetch result:", result);

      if (result.success) {
        console.log(
          "✅ Plumbers fetched successfully:",
          result.data.length,
          "plumbers",
        );
        console.log("📄 Plumber data:", result.data);
        console.log("📄 Setting plumbers state with:", result.data);
        setPlumbers(result.data);
      } else {
        console.error("❌ Failed to fetch plumbers:", result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error("❌ Fetch plumbers error:", error);
      setError("Failed to fetch plumbers: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (plumberId) => {
    if (window.confirm("Are you sure you want to delete this plumber?")) {
      const result = await plumberController.deletePlumber(plumberId);
      if (result.success) {
        setPlumbers(plumbers.filter((plumber) => plumber.id !== plumberId));
        alert("Plumber deleted successfully!");
      } else {
        alert("Failed to delete plumber: " + result.error);
      }
    }
  };

  const handleToggleStatus = async (plumberId, currentStatus) => {
    const newStatus = !currentStatus;
    const result = await plumberController.togglePlumberStatus(
      plumberId,
      newStatus,
    );
    if (result.success) {
      setPlumbers(
        plumbers.map((plumber) =>
          plumber.id === plumberId
            ? {
                ...plumber,
                isActive: newStatus,
                lastActiveDate: newStatus ? new Date() : plumber.lastActiveDate,
              }
            : plumber,
        ),
      );
      alert(`Plumber ${newStatus ? "activated" : "deactivated"} successfully!`);
    } else {
      alert("Failed to update plumber status: " + result.error);
    }
  };

  const filteredPlumbers = plumbers.filter((plumber) => {
    const matchesSearch =
      searchQuery === "" ||
      plumber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plumber.phone.includes(searchQuery) ||
      plumber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plumber.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plumber.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && plumber.isActive) ||
      (statusFilter === "inactive" && !plumber.isActive);

    return matchesSearch && matchesStatus;
  });

  console.log("🔍 Total plumbers:", plumbers.length);
  console.log("🔍 Filtered plumbers:", filteredPlumbers.length);
  console.log("🔍 Search query:", searchQuery);
  console.log("🔍 Status filter:", statusFilter);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
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
          <Link to="/admin/items" className="nav-item">
            Products
          </Link>
          <Link to="/admin/plumbers" className="nav-item active">
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
          <h2>Plumber Management</h2>
          <div className="header-profile">
            <span>{currentUser?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-container">
          <div className="plumber-management">
            {/* Filters and Search */}
            <div className="filter-section">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search plumbers by name, phone, email, area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-container">
                <select
                  className="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <button
                className="btn-primary"
                onClick={() => navigate("/admin/plumbers/add")}
              >
                + Add New Plumber
              </button>
            </div>

            {/* Stats Summary */}
            <div className="plumber-stats">
              <div className="stat-item">
                <span className="stat-number">{plumbers.length}</span>
                <span className="stat-label">Total Plumbers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {plumbers.filter((p) => p.isActive).length}
                </span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {plumbers.filter((p) => !p.isActive).length}
                </span>
                <span className="stat-label">Inactive</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {plumbers.filter((p) => p.isActive).length > 0
                    ? Math.round(
                        (plumbers
                          .filter((p) => p.isActive)
                          .reduce((acc, p) => acc + (p.rating || 0), 0) /
                          plumbers.filter((p) => p.isActive).length) *
                          10,
                      ) / 10
                    : 0}
                </span>
                <span className="stat-label">Avg Rating</span>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading plumbers...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="table-container">
                <table className="plumber-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Experience</th>
                      <th>Rate/Hour</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Jobs Done</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlumbers.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="no-data">
                          {searchQuery || statusFilter !== "all"
                            ? "No plumbers match your search criteria"
                            : "No plumbers found. Add your first plumber!"}
                        </td>
                      </tr>
                    ) : (
                      filteredPlumbers.map((plumber) => (
                        <tr key={plumber.id} className="plumber-row">
                          <td>
                            <div className="plumber-info">
                              <div className="plumber-name">{plumber.name}</div>
                              <div className="plumber-specialization">
                                {plumber.specialization?.join(", ") ||
                                  "General Plumbing"}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="contact-info">
                              <div>{plumber.phone}</div>
                              <div className="email">{plumber.email}</div>
                            </div>
                          </td>
                          <td>
                            <div className="location-info">
                              <div>{plumber.area}</div>
                              <div className="city">
                                {plumber.city} - {plumber.pincode}
                              </div>
                            </div>
                          </td>
                          <td>{plumber.experience}</td>
                          <td>₹{plumber.hourlyRate}/hr</td>
                          <td>
                            <div className="status-container">
                              {getStatusBadge(plumber.isActive)}
                              <button
                                className={`toggle-btn ${plumber.isActive ? "deactivate" : "activate"}`}
                                onClick={() =>
                                  handleToggleStatus(
                                    plumber.id,
                                    plumber.isActive,
                                  )
                                }
                                title={
                                  plumber.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {plumber.isActive ? "◉" : "◯"}
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="rating">
                              ⭐ {plumber.rating || 0}/5
                            </div>
                          </td>
                          <td>{plumber.completedJobs || 0}</td>
                          <td>{formatDate(plumber.joinedDate)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-edit"
                                onClick={() =>
                                  navigate(`/admin/plumbers/edit/${plumber.id}`)
                                }
                                title="Edit Plumber"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDelete(plumber.id)}
                                title="Delete Plumber"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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

export default PlumberManagement;
