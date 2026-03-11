import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import plumberController from "../controllers/plumberController";
import plumberService from "../services/plumberService";
import "./PlumberAddScreen.css";
import "../../Dashboard.css"; // Import Dashboard CSS for sidebar styling

const PlumberAddScreen = () => {
  const { currentUser, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const handleSignOut = async () => {
    await logout();
    navigate("/signin");
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    area: "",
    pincode: "",
    experience: "",
    specialization: [],
    hourlyRate: "",
    isActive: true,
    rating: 0,
    completedJobs: 0,
    emergencyAvailable: false,
    profileImage: "",
    workingHours: {
      start: "09:00",
      end: "18:00",
    },
    availableDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  });

  const [errors, setErrors] = useState({});

  const specializationOptions = [
    "General Plumbing",
    "Pipe Installation",
    "Drain Cleaning",
    "Water Tank Installation",
    "Bathroom Fitting",
    "Kitchen Plumbing",
    "Emergency Repairs",
    "Leak Detection",
    "Water Heater Service",
    "Sewage System",
  ];

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchPlumber = async () => {
      if (isEditMode) {
        try {
          const plumber = await plumberService.getPlumberById(id);
          if (plumber) {
            setFormData({
              name: plumber.name || "",
              phone: plumber.phone || "",
              email: plumber.email || "",
              address: plumber.address || "",
              city: plumber.city || "",
              area: plumber.area || "",
              pincode: plumber.pincode || "",
              experience: plumber.experience || "",
              specialization: plumber.specialization || [],
              hourlyRate: plumber.hourlyRate || "",
              isActive:
                plumber.isActive !== undefined ? plumber.isActive : true,
              rating: plumber.rating || 0,
              completedJobs: plumber.completedJobs || 0,
              emergencyAvailable: plumber.emergencyAvailable || false,
              profileImage: plumber.profileImage || "",
              workingHours: plumber.workingHours || {
                start: "09:00",
                end: "18:00",
              },
              availableDays: plumber.availableDays || [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            });
          }
        } catch (error) {
          console.error("Error fetching plumber:", error);
          alert("Error fetching plumber details");
        }
      }
    };
    fetchPlumber();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTimeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleSpecializationChange = (specialization) => {
    setFormData((prev) => {
      const currentSpecs = prev.specialization;
      const newSpecs = currentSpecs.includes(specialization)
        ? currentSpecs.filter((s) => s !== specialization)
        : [...currentSpecs, specialization];

      return {
        ...prev,
        specialization: newSpecs,
      };
    });
  };

  const handleDayChange = (day) => {
    setFormData((prev) => {
      const currentDays = prev.availableDays;
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];

      return {
        ...prev,
        availableDays: newDays,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Plumber name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    }

    if (
      formData.hourlyRate &&
      (isNaN(formData.hourlyRate) || Number(formData.hourlyRate) < 0)
    ) {
      newErrors.hourlyRate = "Hourly rate must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAndNew = false) => {
    if (!validateForm()) {
      return;
    }

    try {
      const plumberData = {
        ...formData,
        hourlyRate: Number(formData.hourlyRate) || 0,
        rating: Number(formData.rating) || 0,
        completedJobs: Number(formData.completedJobs) || 0,
      };

      if (isEditMode) {
        const result = await plumberController.updatePlumber(id, plumberData);
        if (result.success) {
          alert("Plumber updated successfully!");
          navigate("/admin/plumbers");
        } else {
          if (result.errors) {
            setErrors(result.errors);
          } else {
            alert(result.error || "Failed to update plumber");
          }
        }
      } else {
        const result = await plumberController.createPlumber(plumberData);
        if (result.success) {
          alert("Plumber added successfully!");
          if (saveAndNew) {
            setFormData({
              name: "",
              phone: "",
              email: "",
              address: "",
              city: "",
              area: "",
              pincode: "",
              experience: "",
              specialization: [],
              hourlyRate: "",
              isActive: true,
              rating: 0,
              completedJobs: 0,
              emergencyAvailable: false,
              profileImage: "",
              workingHours: { start: "09:00", end: "18:00" },
              availableDays: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],
            });
            setErrors({});
          } else {
            navigate("/admin/plumbers");
          }
        } else {
          if (result.errors) {
            setErrors(result.errors);
          } else {
            alert(result.error || "Failed to add plumber");
          }
        }
      }
    } catch (error) {
      console.error("Error saving plumber:", error);
      alert("An error occurred while saving the plumber");
    }
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
          <h2>{isEditMode ? "Edit Plumber" : "Add New Plumber"}</h2>
          <div className="header-profile">
            <span>{currentUser?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-container">
          <div className="plumber-add-screen">
            <button
              className="back-btn"
              onClick={() => navigate("/admin/plumbers")}
            >
              ← Back to Plumbers
            </button>

            <div className="header-actions">
              {!isEditMode && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => handleSubmit(true)}
                >
                  Save & New
                </button>
              )}
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSubmit(false)}
              >
                {isEditMode ? "Update Plumber" : "Save Plumber"}
              </button>
            </div>

            <div className="form-container">
              <form className="plumber-form">
                {/* Personal Information */}
                <div className="section-header">Personal Information</div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label htmlFor="name">
                      Full Name<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "error" : ""}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <span className="error-text">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone Number<span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "error" : ""}
                      placeholder="Enter 10-digit phone number"
                    />
                    {errors.phone && (
                      <span className="error-text">{errors.phone}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email Address<span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <span className="error-text">{errors.email}</span>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div className="section-header">Address Information</div>

                <div className="form-group">
                  <label htmlFor="address">
                    Street Address<span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "error" : ""}
                    placeholder="Enter complete address"
                    rows="2"
                  />
                  {errors.address && (
                    <span className="error-text">{errors.address}</span>
                  )}
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label htmlFor="area">
                      Area/Locality<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className={errors.area ? "error" : ""}
                      placeholder="Enter area/locality"
                    />
                    {errors.area && (
                      <span className="error-text">{errors.area}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">
                      City<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "error" : ""}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <span className="error-text">{errors.city}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">
                      Pincode<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={errors.pincode ? "error" : ""}
                      placeholder="Enter 6-digit pincode"
                    />
                    {errors.pincode && (
                      <span className="error-text">{errors.pincode}</span>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="section-header">Professional Information</div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="experience">
                      Experience<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={errors.experience ? "error" : ""}
                      placeholder="e.g., 5 years, 2+ years"
                    />
                    {errors.experience && (
                      <span className="error-text">{errors.experience}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      id="hourlyRate"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className={errors.hourlyRate ? "error" : ""}
                      placeholder="Enter hourly rate"
                      min="0"
                      step="50"
                    />
                    {errors.hourlyRate && (
                      <span className="error-text">{errors.hourlyRate}</span>
                    )}
                  </div>
                </div>

                {/* Specialization */}
                <div className="form-group">
                  <label>Specialization</label>
                  <div className="checkbox-grid">
                    {specializationOptions.map((spec) => (
                      <label key={spec} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={() => handleSpecializationChange(spec)}
                        />
                        {spec}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Working Hours & Availability */}
                <div className="section-header">
                  Working Hours & Availability
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="startTime">Working Hours Start</label>
                    <input
                      type="time"
                      id="startTime"
                      value={formData.workingHours.start}
                      onChange={(e) =>
                        handleTimeChange("start", e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime">Working Hours End</label>
                    <input
                      type="time"
                      id="endTime"
                      value={formData.workingHours.end}
                      onChange={(e) => handleTimeChange("end", e.target.value)}
                    />
                  </div>
                </div>

                {/* Available Days */}
                <div className="form-group">
                  <label>Available Days</label>
                  <div className="checkbox-grid days-grid">
                    {dayOptions.map((day) => (
                      <label key={day} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.availableDays.includes(day)}
                          onChange={() => handleDayChange(day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status & Options */}
                <div className="section-header">Status & Options</div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      Active Status
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="emergencyAvailable"
                        checked={formData.emergencyAvailable}
                        onChange={handleChange}
                      />
                      Available for Emergency Calls
                    </label>
                  </div>
                </div>

                {/* Performance Metrics (Edit Mode Only) */}
                {isEditMode && (
                  <>
                    <div className="section-header">Performance Metrics</div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="rating">Rating (0-5)</label>
                        <input
                          type="number"
                          id="rating"
                          name="rating"
                          value={formData.rating}
                          onChange={handleChange}
                          min="0"
                          max="5"
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="completedJobs">Completed Jobs</label>
                        <input
                          type="number"
                          id="completedJobs"
                          name="completedJobs"
                          value={formData.completedJobs}
                          onChange={handleChange}
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlumberAddScreen;
