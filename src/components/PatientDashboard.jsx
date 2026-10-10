import React, { useEffect, useState } from "react";
import { Link} from "react-router-dom";
import axios from "axios";

const PatientDashboard = () => {
  const patient = JSON.parse(localStorage.getItem("patient"));

  const [upcomingAppointment, setUpcomingAppointment] = useState(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUpcomingAppointment = async () => {
      try {
        if (!token) {
          setLoadingAppointment(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/appointments/my-upcoming",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setUpcomingAppointment(response.data.appointment || null);
      } catch (error) {
        console.error(
          "Error fetching upcoming appointment:",
          error.response?.data || error.message,
        );
        setUpcomingAppointment(null);
      } finally {
        setLoadingAppointment(false);
      }
    };

    fetchUpcomingAppointment();
  }, [token]);

  const displayString = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',  // "Tuesday"
    day: 'numeric',   // "29"
    month: 'long',    // "September"
    year: 'numeric'   // "2026"
  });

  const patientName = patient?.name || "Patient";
  return (
    <div className="patient-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="patient-sidebar">
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>

          <div>
            <h4>BRAVOS</h4>
            <span>Patient Portal</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <Link to="/patient-dashboard" className="sidebar-link active">
            <i className="bi bi-grid-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/appointment" className="sidebar-link">
            <i className="bi bi-calendar-plus"></i>
            <span>Book Appointment</span>
          </Link>

          <Link to="/my-appointments" className="sidebar-link">
            <i className="bi bi-calendar-check"></i>
            <span>My Appointments</span>
          </Link>

          <Link to="/medical-records" className="sidebar-link">
            <i className="bi bi-file-earmark-medical"></i>
            <span>Medical Records</span>
          </Link>

          <Link to="/prescriptions" className="sidebar-link">
            <i className="bi bi-capsule"></i>
            <span>Prescriptions</span>
          </Link>

          <Link to="/profile" className="sidebar-link">
            <i className="bi bi-person"></i>
            <span>My Profile</span>
          </Link>
        </div>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="dashboard-main">
        {/* TOPBAR */}

        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-date">{displayString}</p>

            <h2>
              Good Morning, <span>{patientName}</span> 👋
            </h2>
          </div>

          <div className="dashboard-top-actions">
            <button className="notification-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-dot"></span>
            </button>

            <div className="patient-profile">
              <div className="profile-avatar">{patientName.charAt(0)}</div>

              <div className="profile-name">
                <h6>{patientName}</h6>
                <span>Patient</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= WELCOME CARD ================= */}

        <section className="dashboard-welcome">
          <div className="welcome-content">
            <span className="welcome-badge">
              <i className="bi bi-heart-pulse-fill"></i>
              BRAVOS HEALTHCARE
            </span>

            <h1>Your Health, Our Priority.</h1>

            <p>
              Manage your appointments, access your medical records, and stay
              connected with your healthcare providers.
            </p>

            <Link to="/appointment" className="welcome-btn">
              Book an Appointment
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="welcome-icon">
            <i className="bi bi-heart-pulse"></i>
          </div>
        </section>

        {/* ================= HEALTH OVERVIEW ================= */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <span className="section-label">OVERVIEW</span>
              <h3>Health Overview</h3>
            </div>

            <Link to="/medical-records" className="view-all">
              View Records
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            <div className="col-xl-3 col-md-6">
              <div className="health-card">
                <div className="health-icon appointments-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>

                <div>
                  <span>Appointments</span>
                  <h3>03</h3>
                  <small>Upcoming visits</small>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="health-card">
                <div className="health-icon records-icon">
                  <i className="bi bi-file-earmark-medical"></i>
                </div>

                <div>
                  <span>Medical Records</span>
                  <h3>12</h3>
                  <small>Available records</small>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="health-card">
                <div className="health-icon prescription-icon">
                  <i className="bi bi-capsule"></i>
                </div>

                <div>
                  <span>Prescriptions</span>
                  <h3>05</h3>
                  <small>Active prescriptions</small>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6">
              <div className="health-card">
                <div>
                  <span>Your Doctors</span>
                  <h3>04</h3>
                  <small>Healthcare specialists</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= UPCOMING APPOINTMENT ================= */}

        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <span className="section-label">NEXT VISIT</span>
              <h3>Upcoming Appointment</h3>
            </div>

            <Link to="/my-appointments" className="view-all">
              View All
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loadingAppointment ? (
            <div className="appointment-card-dashboard">
              <div className="w-100 text-center py-4">
                <div className="spinner-border text-primary mb-2"></div>
                <p className="mb-0">Loading upcoming appointment...</p>
              </div>
            </div>
          ) : upcomingAppointment ? (
            <div className="appointment-card-dashboard">
              <div className="appointment-date-box">
                <span>
                  {new Date(upcomingAppointment.date)
                    .toLocaleString("en-US", { month: "short" })
                    .toUpperCase()}
                </span>

                <h2>{new Date(upcomingAppointment.date).getDate()}</h2>

                <small>
                  {new Date(upcomingAppointment.date).getFullYear()}
                </small>
              </div>

              <div className="appointment-details">
                <span className="appointment-type">
                  {upcomingAppointment.department || "General Consultation"}
                </span>

                <h4>{upcomingAppointment.doctor?.name || "Doctor"}</h4>

                <small>
                  {upcomingAppointment.doctor?.specialization || ""}
                </small>

                <div className="appointment-info">
                  <span>
                    <i className="bi bi-clock"></i>
                    {upcomingAppointment.time}
                  </span>

                  <span>
                    <i className="bi bi-building"></i>
                    Bravos Hospital
                  </span>
                </div>
              </div>

              <div className="appointment-status">
                <span
                  className={
                    upcomingAppointment.status === "approved"
                      ? "status-confirmed"
                      : "status-pending"
                  }
                >
                  <i
                    className={
                      upcomingAppointment.status === "approved"
                        ? "bi bi-check-circle-fill"
                        : "bi bi-clock-fill"
                    }
                  ></i>

                  {upcomingAppointment.status
                    ? upcomingAppointment.status.charAt(0).toUpperCase() +
                      upcomingAppointment.status.slice(1)
                    : "Pending"}
                </span>

                <Link to="/my-appointments" className="appointment-manage-btn">
                  Manage Appointment
                </Link>
              </div>
            </div>
          ) : (
            <div className="appointment-card-dashboard">
              <div className="w-100 text-center py-4">
                <div className="mb-3">
                  <i
                    className="bi bi-calendar-x"
                    style={{ fontSize: "42px", opacity: 0.5 }}
                  ></i>
                </div>

                <h5>No Upcoming Appointment</h5>

                <p className="text-muted mb-3">
                  You don't have any upcoming appointments.
                </p>

                <Link to="/appointment" className="appointment-manage-btn">
                  Book Appointment
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ================= BOTTOM GRID ================= */}

        <div className="row g-4 dashboard-bottom">
          {/* QUICK ACTIONS */}

          <div className="col-lg-5">
            <div className="dashboard-panel">
              <div className="panel-header">
                <h4>Quick Actions</h4>
              </div>

              <div className="quick-actions">
                <Link to="/appointment" className="quick-action">
                  <div className="quick-icon">
                    <i className="bi bi-calendar-plus"></i>
                  </div>

                  <div>
                    <h6>Book Appointment</h6>
                    <p>Schedule a visit</p>
                  </div>

                  <i className="bi bi-chevron-right"></i>
                </Link>

                <Link to="/medical-records" className="quick-action">
                  <div className="quick-icon">
                    <i className="bi bi-file-medical"></i>
                  </div>

                  <div>
                    <h6>Medical Records</h6>
                    <p>View your health history</p>
                  </div>

                  <i className="bi bi-chevron-right"></i>
                </Link>

                <Link to="/profile" className="quick-action">
                  <div className="quick-icon">
                    <i className="bi bi-person-gear"></i>
                  </div>

                  <div>
                    <h6>Update Profile</h6>
                    <p>Manage personal information</p>
                  </div>

                  <i className="bi bi-chevron-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}

          <div className="col-lg-7">
            <div className="dashboard-panel">
              <div className="panel-header">
                <h4>Recent Activity</h4>

                <Link to="/medical-records">View All</Link>
              </div>

              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi bi-file-earmark-plus"></i>
                  </div>

                  <div className="activity-content">
                    <h6>Medical Record Added</h6>
                    <p>Your blood test report is now available.</p>
                  </div>

                  <span>Today</span>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>

                  <div className="activity-content">
                    <h6>Appointment Confirmed</h6>
                    <p>Your appointment has been successfully confirmed.</p>
                  </div>

                  <span>Yesterday</span>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">
                    <i className="bi bi-capsule"></i>
                  </div>

                  <div className="activity-content">
                    <h6>Prescription Updated</h6>
                    <p>Your doctor has updated your prescription.</p>
                  </div>

                  <span>Aug 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
