import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = searchParams.get("role") || "patient";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forgotRoutes = {
    patient: "patients",
    doctor: "doctors",
    admin: "admin",
  };

  const apiRole = forgotRoutes[role];

  // ==============================
  // SEND OTP
  // ==============================

  const sendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!apiRole) {
      setError("Invalid account type.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:5000/api/${apiRole}/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        }
      );

      setSuccess(response.data.message);
      setStep(2);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // RESET PASSWORD
  // ==============================

  const resetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // OTP validation
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    // Password validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Confirm password validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `http://localhost:5000/api/${apiRole}/reset-password`,
        {
          email: email.trim().toLowerCase(),
          otp,
          newPassword,
        }
      );

      setSuccess(response.data.message);

      // Redirect after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // ROLE DISPLAY
  // ==============================

  const roleName =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <section className="forgot-password-page">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-12 col-md-9 col-lg-6 col-xl-5">

            <div className="forgot-password-card">

              {/* LOGO / ICON */}
              <div className="forgot-password-icon">
                <i
                  className={
                    step === 1
                      ? "bi bi-shield-lock-fill"
                      : "bi bi-key-fill"
                  }
                ></i>
              </div>

              {/* PROGRESS */}
              <div className="forgot-progress">
                <div
                  className={`progress-step ${
                    step >= 1 ? "active" : ""
                  }`}
                >
                  <span>1</span>
                  <small>Verify</small>
                </div>

                <div
                  className={`progress-line ${
                    step >= 2 ? "active" : ""
                  }`}
                ></div>

                <div
                  className={`progress-step ${
                    step >= 2 ? "active" : ""
                  }`}
                >
                  <span>2</span>
                  <small>Reset</small>
                </div>
              </div>

              {/* ==============================
                  STEP 1
              ============================== */}

              {step === 1 && (
                <div className="forgot-content">

                  <div className="forgot-header">
                    <span className="forgot-tag">
                      {roleName} ACCOUNT
                    </span>

                    <h2>Forgot Password?</h2>

                    <p>
                      Enter your registered email address and
                      we'll send you a secure OTP.
                    </p>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="forgot-alert error">
                      <i className="bi bi-exclamation-circle-fill"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div className="forgot-alert success">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={sendOTP}>

                    <div className="forgot-input-group">
                      <label>Email Address</label>

                      <div className="forgot-input-wrapper">
                        <i className="bi bi-envelope"></i>

                        <input
                          type="email"
                          placeholder="Enter your registered email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="forgot-submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send OTP
                          <i className="bi bi-arrow-right ms-2"></i>
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}

              {/* ==============================
                  STEP 2
              ============================== */}

              {step === 2 && (
                <div className="forgot-content">

                  <div className="forgot-header">
                    <span className="forgot-tag">
                      RESET PASSWORD
                    </span>

                    <h2>Create New Password</h2>

                    <p>
                      Enter the OTP sent to
                      <strong> {email}</strong> and create
                      your new password.
                    </p>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="forgot-alert error">
                      <i className="bi bi-exclamation-circle-fill"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                    <div className="forgot-alert success">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={resetPassword}>

                    {/* OTP */}
                    <div className="forgot-input-group">
                      <label>6-Digit OTP</label>

                      <div className="forgot-input-wrapper">
                        <i className="bi bi-shield-lock"></i>

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
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
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="forgot-input-group">
                      <label>New Password</label>

                      <div className="forgot-input-wrapper">
                        <i className="bi bi-lock"></i>

                        <input
                          type={
                            showNewPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          minLength={8}
                          required
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowNewPassword(
                              !showNewPassword
                            )
                          }
                        >
                          <i
                            className={
                              showNewPassword
                                ? "bi bi-eye-slash"
                                : "bi bi-eye"
                            }
                          ></i>
                        </button>
                      </div>

                      <small className="password-hint">
                        Minimum 8 characters
                      </small>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="forgot-input-group">
                      <label>Confirm Password</label>

                      <div className="forgot-input-wrapper">
                        <i className="bi bi-shield-check"></i>

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(
                              e.target.value
                            )
                          }
                          required
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                        >
                          <i
                            className={
                              showConfirmPassword
                                ? "bi bi-eye-slash"
                                : "bi bi-eye"
                            }
                          ></i>
                        </button>
                      </div>

                      {/* PASSWORD MATCH */}
                      {confirmPassword && (
                        <small
                          className={
                            newPassword === confirmPassword
                              ? "password-match"
                              : "password-mismatch"
                          }
                        >
                          {newPassword === confirmPassword ? (
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

                    {/* RESET BUTTON */}
                    <button
                      type="submit"
                      className="forgot-submit-btn"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          Reset Password
                          <i className="bi bi-check-circle ms-2"></i>
                        </>
                      )}
                    </button>

                  </form>

                  {/* CHANGE EMAIL */}
                  <button
                    type="button"
                    className="change-email-btn"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Change Email
                  </button>

                </div>
              )}

              {/* BACK TO LOGIN */}
              <div className="forgot-footer">
                <Link to="/login">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Login
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;