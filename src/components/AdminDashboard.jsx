import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../config/api";

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get("/api/contact");

        setMessages(response.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, []);
  return (
    <div className="admin-dashboard">
      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>

          <div>
            <h4>BRAVOS</h4>
            <span>Admin Panel</span>
          </div>
        </div>

        {/* MENU */}

        <div className="admin-menu">
          <Link to="/admin-dashboard" className="admin-menu-link active">
            <i className="bi bi-grid-fill"></i>
            <span>Dashboard</span>
          </Link>

          <Link to="/admin/register-doctor" className="admin-menu-link">
            <i className="bi bi-person-plus"></i>
            <span>Register Doctor</span>
          </Link>

          <Link to="/admin/doctors" className="admin-menu-link">
            <i className="bi bi-person-badge"></i>
            <span>Manage Doctors</span>
          </Link>

          <Link to="/admin/patients" className="admin-menu-link">
            <i className="bi bi-people"></i>
            <span>Manage Patients</span>
          </Link>

          <Link to="/admin/appointments" className="admin-menu-link">
            <i className="bi bi-calendar-check"></i>
            <span>Appointments</span>
          </Link>

          <Link to="/admin/records" className="admin-menu-link">
            <i className="bi bi-file-earmark-medical"></i>
            <span>Medical Records</span>
          </Link>

          <Link to="/admin/reports" className="admin-menu-link">
            <i className="bi bi-bar-chart"></i>
            <span>Reports</span>
          </Link>

          <Link to="/admin/gallery" className="admin-menu-link">
            <i className="bi bi-image"></i>
            <span>Gallery</span>
          </Link>
        </div>

        {/* BOTTOM */}

        <div className="admin-sidebar-bottom">
          <Link to="/admin/profile" className="admin-menu-link">
            <i className="bi bi-person-circle"></i>
            <span>Admin Profile</span>
          </Link>

          <Link to="/" className="admin-menu-link">
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main className="admin-main">
        {/* TOPBAR */}

        <header className="admin-topbar">
          <div>
            <span className="admin-date">ADMINISTRATION</span>

            <h2>
              Welcome, <span>Administrator</span> 👋
            </h2>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>

            <div>
              <h6>Administrator</h6>
              <span>Hospital Admin</span>
            </div>
          </div>
        </header>

        {/* WELCOME */}

        <section className="admin-welcome">
          <div>
            <span className="admin-welcome-tag">
              <i className="bi bi-shield-check"></i>
              ADMIN CONTROL CENTER
            </span>

            <h1>Hospital Management</h1>

            <p>
              Manage doctors, patients, appointments and hospital operations
              from one centralized dashboard.
            </p>
          </div>

          <div className="admin-welcome-icon">
            <i className="bi bi-hospital"></i>
          </div>
        </section>

        {/* STATISTICS */}

        <section className="admin-section">
          <div className="admin-section-title">
            <div>
              <span>OVERVIEW</span>
              <h3>Hospital Statistics</h3>
            </div>
          </div>

          <div className="row g-4">
            {/* DOCTORS */}

            <div className="col-xl-3 col-md-6">
              <div className="admin-stat-card">
                <div className="admin-stat-icon doctor-stat">
                  <i className="bi bi-person-badge"></i>
                </div>

                <div>
                  <span>Total Doctors</span>
                  <h3>24</h3>
                  <small>Registered doctors</small>
                </div>
              </div>
            </div>

            {/* PATIENTS */}

            <div className="col-xl-3 col-md-6">
              <div className="admin-stat-card">
                <div className="admin-stat-icon patient-stat">
                  <i className="bi bi-people"></i>
                </div>

                <div>
                  <span>Total Patients</span>
                  <h3>1,248</h3>
                  <small>Registered patients</small>
                </div>
              </div>
            </div>

            {/* APPOINTMENTS */}

            <div className="col-xl-3 col-md-6">
              <div className="admin-stat-card">
                <div className="admin-stat-icon appointment-stat">
                  <i className="bi bi-calendar-check"></i>
                </div>

                <div>
                  <span>Appointments</span>
                  <h3>86</h3>
                  <small>This month</small>
                </div>
              </div>
            </div>

            {/* PENDING */}

            <div className="col-xl-3 col-md-6">
              <div className="admin-stat-card">
                <div className="admin-stat-icon pending-stat">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <span>Pending</span>
                  <h3>12</h3>
                  <small>Pending appointments</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="admin-section">
          <div className="admin-section-title">
            <div>
              <span>MANAGEMENT</span>
              <h3>Quick Actions</h3>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <Link to="/admin/register-doctor" className="admin-action-card">
                <div className="admin-action-icon">
                  <i className="bi bi-person-plus-fill"></i>
                </div>

                <div>
                  <h5>Register Doctor</h5>

                  <p>Add a new doctor to the hospital system.</p>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="col-lg-4">
              <Link to="/admin/doctors" className="admin-action-card">
                <div className="admin-action-icon">
                  <i className="bi bi-person-badge"></i>
                </div>

                <div>
                  <h5>Manage Doctors</h5>

                  <p>View and manage registered doctors.</p>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="col-lg-4">
              <Link to="/admin/patients" className="admin-action-card">
                <div className="admin-action-icon">
                  <i className="bi bi-people-fill"></i>
                </div>

                <div>
                  <h5>Manage Patients</h5>

                  <p>View registered hospital patients.</p>
                </div>

                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* RECENT APPOINTMENTS */}

        <section className="admin-section">
          <div className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <span>RECENT ACTIVITY</span>
                <h3>Recent Appointments</h3>
              </div>

              <Link to="/admin/appointments">View All</Link>
            </div>

            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Rahul Sharma</td>

                    <td>Dr. Sourav Singh</td>

                    <td>05 Sep 2026</td>

                    <td>10:30 AM</td>

                    <td>
                      <span className="appointment-confirmed">Confirmed</span>
                    </td>
                  </tr>

                  <tr>
                    <td>Priya Singh</td>

                    <td>Dr. Sumit Singh</td>

                    <td>05 Sep 2026</td>

                    <td>11:00 AM</td>

                    <td>
                      <span className="appointment-pending">Pending</span>
                    </td>
                  </tr>

                  <tr>
                    <td>Amit Kumar</td>

                    <td>Dr. Vijendra Singh</td>

                    <td>06 Sep 2026</td>

                    <td>09:30 AM</td>

                    <td>
                      <span className="appointment-confirmed">Confirmed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <div className="admin-messages">
          <div className="admin-section-header">
            <div>
              <span>CONTACT</span>

              <h3>Patient Messages</h3>
            </div>

            <span className="message-count">{messages.length} Messages</span>
          </div>

          {loadingMessages ? (
            <div className="text-center py-4">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-messages">
              <i className="bi bi-chat-square-text"></i>

              <h5>No Messages</h5>

              <p>Patient enquiries will appear here.</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((msg) => (
                <div className="message-card" key={msg._id}>
                  <div className="message-card-header">
                    <div className="message-user">
                      <div className="message-avatar">
                        <i className="bi bi-person"></i>
                      </div>

                      <div>
                        <h5>{msg.name}</h5>

                        <span>{msg.email}</span>
                      </div>
                    </div>

                    <span className={`message-status ${msg.status}`}>
                      {msg.status}
                    </span>
                  </div>

                  <div className="message-details">
                    <div>
                      <i className="bi bi-telephone"></i>
                      {msg.phone}
                    </div>

                    <div>
                      <i className="bi bi-chat-left-text"></i>
                      {msg.subject}
                    </div>
                  </div>

                  <p className="message-content">{msg.message}</p>

                  <small className="message-date">
                    <i className="bi bi-clock me-1"></i>

                    {new Date(msg.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
