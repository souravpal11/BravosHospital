import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const PatientSignup = () => {
  const navigate = useNavigate();

  // ==========================================
  // FORM DATA
  // ==========================================

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  // 1 = Email
  // 2 = OTP
  // 3 = Patient Details
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // STEP 1
  // SEND OTP
  // ==========================================

  const sendOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/patients/send-registration-otp",
        {
          email: email.trim().toLowerCase(),
        }
      );

      setMessage(response.data.message);
      setMessageType("success");

      // Move to OTP step
      setStep(2);
    } catch (error) {
      console.error("Send OTP Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2
  // VERIFY OTP
  // ==========================================

  const verifyOTP = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/patients/verify-registration-otp",
        {
          email: email.trim().toLowerCase(),
          otp: otp,
        }
      );

      // Store verification token
      setVerificationToken(response.data.verificationToken);

      setMessage("Email verified successfully!");
      setMessageType("success");

      // Move to patient details
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        setStep(3);
      }, 700);
    } catch (error) {
      console.error("OTP Verification Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Invalid or expired OTP."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 3
  // REGISTER PATIENT
  // ==========================================

  const registerPatient = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!verificationToken) {
      setMessage(
        "Email verification is required. Please verify your email again."
      );
      setMessageType("error");

      setStep(1);
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/patients/register",
        {
          verificationToken,

          email: email.trim().toLowerCase(),

          name: formData.name.trim(),
          phone: formData.phone.trim(),
          age: formData.age,
          gender: formData.gender,
          password: formData.password,
        }
      );

      setMessage(response.data.message);
      setMessageType("success");

      // Go to login
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Patient Registration Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to create account. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHANGE EMAIL
  // ==========================================

  const changeEmail = () => {
    setEmail("");
    setOtp("");
    setVerificationToken("");

    setStep(1);

    setMessage("");
    setMessageType("");
  };

  // ==========================================
  // BACK TO OTP
  // ==========================================

  const backToOTP = () => {
    setStep(2);

    setMessage("");
    setMessageType("");
  };

  return (
    <section className="signup-page">
      <div className="container">
        <div className="row justify-content-center py-5">
          <div className="col-lg-10">

            <div className="signup-wrapper">

              {/* =====================================
                  LEFT SIDE
              ===================================== */}

              <div className="signup-info">

                <div className="signup-icon">
                  <i
                    className={
                      step === 1
                        ? "bi bi-envelope-fill"
                        : step === 2
                        ? "bi bi-shield-check"
                        : "bi bi-person-plus-fill"
                    }
                  ></i>
                </div>

                <h1>
                  Join <span>Bravos Hospital</span>
                </h1>

                <p>
                  Create your patient account and get easy
                  access to appointments and healthcare
                  services.
                </p>

                <div className="signup-benefits">

                  <div>
                    <i className="bi bi-envelope-check-fill"></i>
                    <span>Verified email account</span>
                  </div>

                  <div>
                    <i className="bi bi-calendar-check-fill"></i>
                    <span>Book appointments easily</span>
                  </div>

                  <div>
                    <i className="bi bi-person-lines-fill"></i>
                    <span>Manage your healthcare profile</span>
                  </div>

                  <div>
                    <i className="bi bi-shield-check"></i>
                    <span>Secure patient information</span>
                  </div>

                </div>
              </div>

              {/* =====================================
                  RIGHT SIDE
              ===================================== */}

              <div className="signup-form-container">

                {/* =================================
                    PROGRESS
                ================================= */}

                <div className="signup-progress">

                  <div
                    className={`signup-step ${
                      step >= 1 ? "active" : ""
                    }`}
                  >
                    <span>1</span>
                    <small>Email</small>
                  </div>

                  <div
                    className={`signup-progress-line ${
                      step >= 2 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`signup-step ${
                      step >= 2 ? "active" : ""
                    }`}
                  >
                    <span>2</span>
                    <small>Verify</small>
                  </div>

                  <div
                    className={`signup-progress-line ${
                      step >= 3 ? "active" : ""
                    }`}
                  ></div>

                  <div
                    className={`signup-step ${
                      step >= 3 ? "active" : ""
                    }`}
                  >
                    <span>3</span>
                    <small>Details</small>
                  </div>

                </div>

                {/* =================================
                    MESSAGE
                ================================= */}

                {message && (
                  <div
                    className={`signup-message ${
                      messageType === "success"
                        ? "success"
                        : "error"
                    }`}
                  >
                    <i
                      className={
                        messageType === "success"
                          ? "bi bi-check-circle-fill"
                          : "bi bi-exclamation-circle-fill"
                      }
                    ></i>

                    {message}
                  </div>
                )}

                {/* =================================
                    STEP 1
                    EMAIL
                ================================= */}

                {step === 1 && (
                  <>
                    <div className="signup-header">

                      <span className="section-tag">
                        EMAIL VERIFICATION
                      </span>

                      <h2>Verify Your Email</h2>

                      <p>
                        Enter your email address to receive
                        a verification code.
                      </p>

                    </div>

                    <form onSubmit={sendOTP}>

                      <div className="mb-4">

                        <label className="form-label">
                          Email Address
                        </label>

                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          required
                        />

                        <small className="password-hint">
                          A 6-digit verification code will
                          be sent to this email.
                        </small>

                      </div>

                      <button
                        type="submit"
                        className="signup-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            Send Verification Code
                            <i className="bi bi-arrow-right ms-2"></i>
                          </>
                        )}
                      </button>

                    </form>
                  </>
                )}

                {/* =================================
                    STEP 2
                    OTP
                ================================= */}

                {step === 2 && (
                  <>
                    <div className="signup-header">

                      <span className="section-tag">
                        EMAIL VERIFICATION
                      </span>

                      <h2>Verify Your Email</h2>

                      <p>
                        We've sent a 6-digit OTP to
                        <strong> {email}</strong>
                      </p>

                    </div>

                    <form onSubmit={verifyOTP}>

                      <div className="otp-box">

                        <div className="otp-icon">
                          <i className="bi bi-envelope-check-fill"></i>
                        </div>

                        <h4>
                          Enter Verification Code
                        </h4>

                        <p>
                          Check your inbox for the OTP.
                        </p>

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          className="otp-input"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) =>
                            setOtp(
                              e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6)
                            )
                          }
                          required
                        />

                      </div>

                      <button
                        type="submit"
                        className="signup-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Email
                            <i className="bi bi-check-circle ms-2"></i>
                          </>
                        )}
                      </button>

                    </form>

                    <button
                      type="button"
                      className="change-email-btn"
                      onClick={changeEmail}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Change Email
                    </button>
                  </>
                )}

                {/* =================================
                    STEP 3
                    PATIENT DETAILS
                ================================= */}

                {step === 3 && (
                  <>
                    <div className="signup-header">

                      <span className="section-tag">
                        EMAIL VERIFIED
                      </span>

                      <h2>Create Your Account</h2>

                      <p>
                        Your email is verified. Now enter
                        your personal details.
                      </p>

                    </div>

                    <form onSubmit={registerPatient}>

                      <div className="row">

                        {/* NAME */}

                        <div className="col-12 mb-3">

                          <label className="form-label">
                            Full Name
                          </label>

                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />

                        </div>

                        {/* EMAIL */}

                        <div className="col-12 mb-3">

                          <label className="form-label">
                            Verified Email
                          </label>

                          <input
                            type="email"
                            className="form-control"
                            value={email}
                            disabled
                          />

                        </div>

                        {/* PHONE */}

                        <div className="col-md-6 mb-3">

                          <label className="form-label">
                            Phone Number
                          </label>

                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />

                        </div>

                        {/* AGE */}

                        <div className="col-md-6 mb-3">

                          <label className="form-label">
                            Age
                          </label>

                          <input
                            type="number"
                            className="form-control"
                            name="age"
                            placeholder="Enter age"
                            min="1"
                            max="120"
                            value={formData.age}
                            onChange={handleChange}
                            required
                          />

                        </div>

                        {/* GENDER */}

                        <div className="col-12 mb-3">

                          <label className="form-label">
                            Gender
                          </label>

                          <select
                            className="form-select"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                          >
                            <option value="">
                              Select Gender
                            </option>

                            <option value="Male">
                              Male
                            </option>

                            <option value="Female">
                              Female
                            </option>

                            <option value="Other">
                              Other
                            </option>

                          </select>

                        </div>

                        {/* PASSWORD */}

                        <div className="col-md-6 mb-4">

                          <label className="form-label">
                            Password
                          </label>

                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                          />

                          <small className="password-hint">
                            Minimum 8 characters
                          </small>

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="col-md-6 mb-4">

                          <label className="form-label">
                            Confirm Password
                          </label>

                          <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />

                          {formData.confirmPassword && (
                            <small
                              className={
                                formData.password ===
                                formData.confirmPassword
                                  ? "password-match"
                                  : "password-mismatch"
                              }
                            >
                              {formData.password ===
                              formData.confirmPassword ? (
                                <>
                                  <i className="bi bi-check-circle-fill"></i>{" "}
                                  Passwords match
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-x-circle-fill"></i>{" "}
                                  Passwords do not match
                                </>
                              )}
                            </small>
                          )}

                        </div>

                      </div>

                      <button
                        type="submit"
                        className="signup-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <i className="bi bi-check-circle ms-2"></i>
                          </>
                        )}
                      </button>

                    </form>

                    <button
                      type="button"
                      className="change-email-btn"
                      onClick={backToOTP}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back to Verification
                    </button>

                  </>
                )}

                {/* LOGIN */}

                <p className="signup-login">
                  Already have an account?

                  <Link to="/login">
                    Login
                  </Link>
                </p>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PatientSignup;