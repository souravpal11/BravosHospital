import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      let response;

      // =========================
      // PATIENT LOGIN
      // =========================
      if (role === "patient") {
        response = await axios.post(
          "http://localhost:5000/api/patients/login",
          {
            email,
            password,
          },
        );

        // Save JWT Token
        localStorage.setItem("token", response.data.token);

        // Save role
        localStorage.setItem("role", "patient");

        // Save patient data
        localStorage.setItem("patient", JSON.stringify(response.data.patient));

        setMessage("Patient login successful!");
        setMessageType("success");

        // Redirect to patient dashboard
        setTimeout(() => {
          navigate("/patient-dashboard");
        }, 800);
      }

      // =========================
      // DOCTOR LOGIN
      // =========================
      else if (role === "doctor") {
        response = await axios.post("http://localhost:5000/api/doctors/login", {
          email,
          password,
        });

        // Save JWT Token
        localStorage.setItem("token", response.data.token);

        // Save role
        localStorage.setItem("role", "doctor");

        // Save doctor data
        localStorage.setItem("doctor", JSON.stringify(response.data.doctor));

        setMessage("Doctor login successful!");
        setMessageType("success");

        // Redirect to doctor dashboard
        setTimeout(() => {
          navigate("/doctor-dashboard");
        }, 800);
      } else if (role === "admin") {
        response = await axios.post("http://localhost:5000/api/admin/login", {
          email,
          password,
        });

        // Save token
        localStorage.setItem("token", response.data.token);

        // Save role
        localStorage.setItem("role", "admin");

        // Save admin data
        localStorage.setItem("admin", JSON.stringify(response.data.admin));

        setMessage("Admin login successful!");
        setMessageType("success");

        // Redirect
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 800);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message || "Login failed. Please try again.",
      );

      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-10">
            <div className="auth-wrapper">
              {/* Left Side */}
              <div className="auth-info">
                <div className="auth-logo-icon">
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>

                <h1>
                  Welcome to
                  <span> Bravos Hospital</span>
                </h1>

                <p>
                  Access your healthcare account and manage your appointments,
                  medical information, and more.
                </p>

                <div className="auth-info-list">
                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Secure healthcare access
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Easy appointment management
                  </div>

                  <div>
                    <i className="bi bi-check-circle-fill"></i>
                    Trusted medical professionals
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="auth-form-container">
                <div className="auth-form-header">
                  <h2>Welcome Back</h2>

                  <p>Select your account type and login to continue.</p>
                </div>

                {/* SUCCESS / ERROR MESSAGE */}
                {message && (
                  <div
                    className={`alert ${
                      messageType === "success"
                        ? "alert-success"
                        : "alert-danger"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {/* Role Selection */}
                <div className="role-selector">
                  {/* PATIENT */}

                  <button
                    type="button"
                    className={`role-btn ${role === "patient" ? "active" : ""}`}
                    onClick={() => {
                      setRole("patient");
                      setMessage("");
                    }}
                  >
                    <i className="bi bi-person-heart"></i>
                    Patient
                  </button>

                  {/* DOCTOR */}

                  <button
                    type="button"
                    className={`role-btn ${role === "doctor" ? "active" : ""}`}
                    onClick={() => {
                      setRole("doctor");
                      setMessage("");
                    }}
                  >
                    <i className="bi bi-person-badge"></i>
                    Doctor
                  </button>

                  {/* ADMIN */}

                  <button
                    type="button"
                    className={`role-btn ${role === "admin" ? "active" : ""}`}
                    onClick={() => {
                      setRole("admin");
                      setMessage("");
                    }}
                  >
                    <i className="bi bi-shield-lock"></i>
                    Admin
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {/* EMAIL */}
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>

                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="mb-3">
                    <label className="form-label">Password</label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>

                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* OPTIONS */}
                  <div className="auth-options">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember"
                      />

                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>

                    <Link to={`/forgot-password?role=${role}`}>
                      Forgot Password?
                    </Link>
                  </div>

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login as{" "}
                        {role === "patient"
                          ? "Patient"
                          : role === "doctor"
                            ? "Doctor"
                            : "Admin"}
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </button>
                </form>

                {/* Signup */}
                {role === "patient" && (
                  <p className="auth-switch">
                    Don't have an account?
                    <Link to="/signup">Create Account</Link>
                  </p>
                )}

                <Link to="/" className="back-home mt-3">
                  <i className="bi bi-arrow-left"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
