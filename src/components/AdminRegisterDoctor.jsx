import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";

const AdminRegisterDoctor = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    fees: "",
    gender: "",
    image: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Check password
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/api/doctors/register",
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          experience: formData.experience,
          gender: formData.gender,
          password: formData.password,
          fees: formData.fees,
          image: formData.image,
        },
      );

      console.log(response.data);

      setMessage("Doctor registered successfully!");

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        gender: "",
        password: "",
        confirmPassword: "",
        image: "",
        fees:"",
      });
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Something went wrong while registering doctor.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="admin-doctor-page">
      <div className="container py-5">
        {/* PAGE HEADER */}
        <div className="admin-page-header mb-4">
          <div>
            <span className="admin-section-tag">ADMIN PANEL</span>

            <h1>
              Register <span>New Doctor</span>
            </h1>

            <p>Add a new healthcare professional to Bravos Hospital.</p>
          </div>

          <Link to="/admin-dashboard" className="back-dashboard-btn">
            <i className="bi bi-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="doctor-register-card">
              {/* LEFT SIDE */}
              <div className="doctor-register-info">
                <div className="doctor-register-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>

                <h2>Add a Healthcare Professional</h2>

                <p>
                  Register doctors and make them available for appointments and
                  patient management.
                </p>

                <div className="doctor-register-list">
                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Create doctor accounts securely
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Manage doctor information
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Assign specialization and experience
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Enable doctor dashboard access
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="doctor-register-form">
                <div className="doctor-form-header">
                  <span className="admin-section-tag">DOCTOR REGISTRATION</span>

                  <h2>Doctor Details</h2>

                  <p>
                    Fill in the information below to create a doctor account.
                  </p>
                </div>

                {/* MESSAGE */}
                {message && (
                  <div
                    className={`alert ${
                      message === "Doctor registered successfully!"
                        ? "alert-success"
                        : "alert-danger"
                    }`}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* NAME */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Doctor Name</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-person"></i>
                        </span>

                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Dr. Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Email Address</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-envelope"></i>
                        </span>

                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="doctor@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* PHONE */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-telephone"></i>
                        </span>

                        <input
                          type="tel"
                          name="phone"
                          className="form-control"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* SPECIALIZATION */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Specialization</label>

                      <select
                        name="specialization"
                        className="form-select"
                        value={formData.specialization}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Specialization</option>

                        <option value="General Medicine">
                          General Medicine
                        </option>

                        <option value="Cardiology">Cardiology</option>

                        <option value="Orthopedics">Orthopedics</option>

                        <option value="Neurology">Neurology</option>

                        <option value="Dermatology">Dermatology</option>

                        <option value="Pediatrics">Pediatrics</option>

                        <option value="General Surgery">General Surgery</option>

                        <option value="Gynecology">Gynecology</option>
                      </select>
                    </div>

                    {/* EXPERIENCE */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Experience</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-briefcase"></i>
                        </span>

                        <input
                          type="number"
                          name="experience"
                          className="form-control"
                          placeholder="Years of experience"
                          value={formData.experience}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* QUALIFICATION */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Qualification</label>

                      <input
                        type="text"
                        name="qualification"
                        className="form-control"
                        placeholder="MBBS, MD, MS..."
                        value={formData.qualification}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* GENDER */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>

                      <select
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Consultation Fee</label>

                      <div className="input-group">
                        <span className="input-group-text">₹</span>

                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter consultation fee"
                          name="fees"
                          value={formData.fees}
                          onChange={handleChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    {/* IMAGE */}
                    <div className="col-12 mb-3">
                      <label className="form-label">
                        Doctor Profile Image URL
                        <span className="text-muted ms-1">(Optional)</span>
                      </label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-image"></i>
                        </span>

                        <input
                          type="url"
                          name="image"
                          className="form-control"
                          placeholder="https://example.com/doctor.jpg"
                          value={formData.image}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>

                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          placeholder="Create password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">Confirm Password</label>

                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-shield-lock"></i>
                        </span>

                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="register-doctor-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering Doctor...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Register Doctor
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminRegisterDoctor;
