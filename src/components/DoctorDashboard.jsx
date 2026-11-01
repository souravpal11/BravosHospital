import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import imageUrl from "../utils/imageUrl";
import Logo from "../utils/Logo.png";

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("doctor") || "{}");
    } catch {
      return {};
    }
  });
  const token = sessionStorage.getItem("token");
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .get("/api/profile/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data.profile) {
          setDoctor(data.profile);
          sessionStorage.setItem("doctor", JSON.stringify(data.profile));
        }
      })
      .catch((error) =>
        console.error("Error fetching doctor profile photo:", error),
      );
  }, [token]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/dashboard/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error(
          "Error fetching doctor dashboard:",
          error.response?.data || error.message,
        );
        setDashboardError(error.response?.data?.message || "Dashboard data could not be loaded. Please check your login and backend connection.");
      } finally {
        setLoadingDashboard(false);
      }
    };

    if (token) fetchDashboard();
    else {
      setDashboardError("No active doctor session. Please log in again.");
      setLoadingDashboard(false);
    }
  }, [token]);

  const stats = dashboardData?.statistics || {};
  const todayAppointments = dashboardData?.todayAppointments || [];
  const recentPatients = dashboardData?.recentPatients || [];

  const doctorName = doctor?.name || "Dr. Doctor";
  const specialization = doctor?.specialization || "Medical Specialist";

  return (
    <div className="doctor-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="doctor-sidebar">
        {/* LOGO */}

        <div className="doctor-logo">
          <div className="doctor-logo-icon">
             <img
              src={Logo}
              alt="Bravos Hospital Logo"
              className="logo-image"
              style={{ width: "45px", height: "45px" , borderRadius: "12px"}}
            />
          </div>

          <div>
            <h4>BRAVOS</h4>
            <span>Doctor Portal</span>
          </div>
        </div>

        {/* PROFILE */}

        <div className="doctor-sidebar-profile">
          <div className="doctor-sidebar-avatar">
            {doctor?.image ? (
              <img
                src={imageUrl(doctor.image)}
                alt={doctorName}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <i className="bi bi-person"></i>
            )}
          </div>

          <div>
            <h6>{doctorName}</h6>
            <span>{specialization}</span>
          </div>
        </div>

        {/* MENU */}

        <nav className="doctor-menu">
          <Link to="/doctor-dashboard" className="doctor-menu-link active">
            <i className="bi bi-grid-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/doctor/appointments" className="doctor-menu-link">
            <i className="bi bi-calendar-check"></i>
            <span>Appointments</span>
          </Link>

          <Link to="/doctor/patients" className="doctor-menu-link">
            <i className="bi bi-people"></i>
            <span>My Patients</span>
          </Link>

          <Link to="/appointment-queue" className="doctor-menu-link">
            <i className="bi bi-calendar-check"></i>
            <span>Appointment Queue</span>
          </Link>

          <Link to="/doctor/records" className="doctor-menu-link">
            <i className="bi bi-file-earmark-medical"></i>
            <span>Medical Reports</span>
          </Link>

          <Link to="/doctor/prescriptions" className="doctor-menu-link">
            <i className="bi bi-capsule"></i>
            <span>Prescriptions</span>
          </Link>

          <Link to="/doctor/profile" className="doctor-menu-link">
            <i className="bi bi-person-circle"></i>
            <span>My Profile</span>
          </Link>
        </nav>

        {/* BOTTOM */}

        <div className="doctor-sidebar-bottom">
          <Link
            to="/"
            className="doctor-menu-link"
            onClick={() => {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("role");
              sessionStorage.removeItem("doctor");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="doctor-main">
        {dashboardError && <div className="alert alert-danger" role="alert">{dashboardError}</div>}
        {/* TOPBAR */}

        <header className="doctor-topbar">
          <div>
            <span className="doctor-topbar-label">DOCTOR PORTAL</span>

            <h2>
              Welcome, <span>{doctorName}</span> 
            </h2>

            <p>Here's what's happening with your patients today.</p>
          </div>

          <div className="doctor-topbar-profile">
            <div className="doctor-topbar-avatar">
              {doctor?.image ? (
                <img
                  src={imageUrl(doctor.image)}
                  alt={doctorName}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <i className="bi bi-person"></i>
              )}
            </div>

            <div>
              <h6>{doctorName}</h6>
              <span>{specialization}</span>
            </div>
          </div>
        </header>

        {/* ================= WELCOME BANNER ================= */}

        <section className="doctor-welcome">
          <div className="doctor-welcome-content">
            <span>
              <i className="bi bi-shield-check"></i>
              BRAVOS DOCTOR PORTAL
            </span>

            <h1>Your care makes a difference.</h1>

            <p>
              Manage your appointments, patients, medical reports and
              prescriptions from one secure place.
            </p>
          </div>

          <div className="doctor-welcome-icon">
            <i className="bi bi-person-hearts"></i>
          </div>
        </section>

        {/* ================= STATISTICS ================= */}

        <section className="doctor-section">
          <div className="doctor-section-heading">
            <span>OVERVIEW</span>

            <h3>Today's Overview</h3>
          </div>

          <div className="row g-4">
            {/* TODAY'S APPOINTMENTS */}

            <div className="col-xl-3 col-md-6">
              <div className="doctor-stat-card">
                <div className="doctor-stat-icon appointment-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>

                <div>
                  <span>Today's Appointments</span>
                  <h3>
                    {loadingDashboard ? "…" : (dashboardError ? "—" : stats.todayAppointments ?? 0)}
                  </h3>
                  <small>Scheduled for today</small>
                </div>
              </div>
            </div>

            {/* PATIENTS */}

            <div className="col-xl-3 col-md-6">
              <div className="doctor-stat-card">
                <div className="doctor-stat-icon patient-icon">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <span>Total Patients</span>
                  <h3>{loadingDashboard ? "…" : (dashboardError ? "—" : stats.totalPatients ?? 0)}</h3>
                  <small>Under your care</small>
                </div>
              </div>
            </div>

            {/* PENDING */}

            <div className="col-xl-3 col-md-6">
              <div className="doctor-stat-card">
                <div className="doctor-stat-icon pending-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <span>Pending Requests</span>
                  <h3>
                    {loadingDashboard ? "…" : (dashboardError ? "—" : stats.pendingRequests ?? 0)}
                  </h3>
                  <small>Need your attention</small>
                </div>
              </div>
            </div>

            {/* COMPLETED */}

            <div className="col-xl-3 col-md-6">
              <div className="doctor-stat-card">
                <div className="doctor-stat-icon completed-icon">
                  <i className="bi bi-check-circle"></i>
                </div>

                <div>
                  <span>Completed</span>
                  <h3>
                    {loadingDashboard ? "…" : (dashboardError ? "—" : stats.completedThisMonth ?? 0)}
                  </h3>
                  <small>This month</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTENT ================= */}

        <div className="row g-4">
          {/* ================= TODAY APPOINTMENTS ================= */}

          <div className="col-lg-8">
            <section className="doctor-panel">
              <div className="doctor-panel-header">
                <div>
                  <span>TODAY</span>

                  <h3>Today's Appointments</h3>
                </div>

                <Link to="/doctor/appointments">View All</Link>
              </div>

              {loadingDashboard ? (
                <div className="text-center py-4">
                  Loading today's appointments...
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayAppointments.map((appointment) => {
                  const timeParts = (appointment.time || "").match(
                    /^(.*?)(?:\s+(AM|PM))?$/i,
                  );
                  return (
                    <div className="doctor-appointment" key={appointment._id}>
                      <div className="doctor-appointment-time">
                        <strong>
                          {timeParts?.[1] || appointment.time || "—"}
                        </strong>
                        <span>{timeParts?.[2] || ""}</span>
                      </div>
                      <div className="doctor-patient-avatar">
                        {(appointment.name || "P")
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="doctor-appointment-info">
                        <h5>{appointment.name || "Patient"}</h5>
                        <p>
                          <i className="bi bi-telephone"></i>{" "}
                          {appointment.phone || "Phone unavailable"}
                        </p>
                      </div>
                      <div className="doctor-appointment-type">
                        <span>{appointment.department || "Consultation"}</span>
                      </div>
                      <Link
                        to="/doctor/appointments"
                        className="doctor-view-btn"
                      >
                        View
                      </Link>
                    </div>
                  );
                })
              )}
            </section>
          </div>

          {/* ================= QUICK ACTIONS ================= */}

          <div className="col-lg-4">
            <section className="doctor-panel">
              <div className="doctor-panel-header">
                <div>
                  <span>ACTIONS</span>

                  <h3>Quick Actions</h3>
                </div>
              </div>

              <Link to="/doctor/appointments" className="doctor-action">
                <div>
                  <i className="bi bi-calendar-plus"></i>
                </div>

                <section>
                  <h5>Appointments</h5>
                  <p>Manage today's appointments</p>
                </section>

                <i className="bi bi-arrow-right"></i>
              </Link>

              <Link to="/doctor/patients" className="doctor-action">
                <div>
                  <i className="bi bi-person-lines-fill"></i>
                </div>

                <section>
                  <h5>My Patients</h5>
                  <p>View your patient list</p>
                </section>

                <i className="bi bi-arrow-right"></i>
              </Link>

              <Link to="/doctor/records" className="doctor-action">
                <div>
                  <i className="bi bi-file-earmark-medical"></i>
                </div>

                <section>
                  <h5>Medical Reports</h5>
                  <p>Review patient records</p>
                </section>

                <i className="bi bi-arrow-right"></i>
              </Link>

              <Link to="/doctor/prescriptions" className="doctor-action">
                <div>
                  <i className="bi bi-capsule"></i>
                </div>

                <section>
                  <h5>Prescriptions</h5>
                  <p>Create and manage prescriptions</p>
                </section>

                <i className="bi bi-arrow-right"></i>
              </Link>
            </section>
          </div>
        </div>

        {/* ================= RECENT PATIENTS ================= */}

        <section className="doctor-section">
          <div className="doctor-panel">
            <div className="doctor-panel-header">
              <div>
                <span>MY PATIENTS</span>

                <h3>Recent Patients</h3>
              </div>

              <Link to="/doctor/patients">View All</Link>
            </div>

            <div className="table-responsive">
              <table className="table doctor-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Last Visit</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingDashboard ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        Loading patients...
                      </td>
                    </tr>
                  ) : recentPatients.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No patients assigned yet.
                      </td>
                    </tr>
                  ) : (
                    recentPatients.map((patient) => (
                      <tr key={patient._id}>
                        <td>
                          <strong>{patient.name}</strong>
                        </td>
                        <td>{patient.age ?? "—"}</td>
                        <td>{patient.gender || "—"}</td>
                        <td>
                          {patient.lastVisit
                            ? new Date(
                                `${patient.lastVisit}T00:00:00`,
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                        <td>
                          <span className="patient-active">Assigned</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DoctorDashboard;
