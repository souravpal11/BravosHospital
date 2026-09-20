import React from "react";
import { Link } from "react-router-dom";

const DoctorDashboard = () => {
  // Temporary doctor data
  const doctor = JSON.parse(localStorage.getItem("doctor"));

  const doctorName = doctor?.name || "Dr. Doctor";
  const specialization =
    doctor?.specialization || "Medical Specialist";

  return (
    <div className="doctor-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="doctor-sidebar">

        {/* LOGO */}

        <div className="doctor-logo">

          <div className="doctor-logo-icon">
            <i className="bi bi-heart-pulse-fill"></i>
          </div>

          <div>
            <h4>BRAVOS</h4>
            <span>Doctor Portal</span>
          </div>

        </div>


        {/* PROFILE */}

        <div className="doctor-sidebar-profile">

          <div className="doctor-sidebar-avatar">
            <i className="bi bi-person"></i>
          </div>

          <div>
            <h6>{doctorName}</h6>
            <span>{specialization}</span>
          </div>

        </div>


        {/* MENU */}

        <nav className="doctor-menu">

          <Link
            to="/doctor-dashboard"
            className="doctor-menu-link active"
          >
            <i className="bi bi-grid-fill"></i>
            <span>Dashboard</span>
          </Link>


          <Link
            to="/doctor/appointments"
            className="doctor-menu-link"
          >
            <i className="bi bi-calendar-check"></i>
            <span>Appointments</span>
          </Link>


          <Link
            to="/doctor/patients"
            className="doctor-menu-link"
          >
            <i className="bi bi-people"></i>
            <span>My Patients</span>
          </Link>


          <Link
            to="/doctor/records"
            className="doctor-menu-link"
          >
            <i className="bi bi-file-earmark-medical"></i>
            <span>Medical Records</span>
          </Link>


          <Link
            to="/doctor/prescriptions"
            className="doctor-menu-link"
          >
            <i className="bi bi-capsule"></i>
            <span>Prescriptions</span>
          </Link>


          <Link
            to="/doctor/profile"
            className="doctor-menu-link"
          >
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
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("doctor");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </Link>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="doctor-main">

        {/* TOPBAR */}

        <header className="doctor-topbar">

          <div>

            <span className="doctor-topbar-label">
              DOCTOR PORTAL
            </span>

            <h2>
              Good Morning, <span>{doctorName}</span> 👋
            </h2>

            <p>
              Here's what's happening with your patients today.
            </p>

          </div>


          <div className="doctor-topbar-profile">

            <div className="doctor-topbar-avatar">
              <i className="bi bi-person"></i>
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

            <h1>
              Your care makes a difference.
            </h1>

            <p>
              Manage your appointments, patients, medical records
              and prescriptions from one secure place.
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

            <h3>
              Today's Overview
            </h3>

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
                  <h3>08</h3>
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
                  <h3>156</h3>
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
                  <h3>05</h3>
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
                  <h3>42</h3>
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

                  <h3>
                    Today's Appointments
                  </h3>
                </div>

                <Link to="/doctor/appointments">
                  View All
                </Link>

              </div>


              {/* APPOINTMENT */}

              <div className="doctor-appointment">

                <div className="doctor-appointment-time">
                  <strong>09:00</strong>
                  <span>AM</span>
                </div>

                <div className="doctor-patient-avatar">
                  RS
                </div>

                <div className="doctor-appointment-info">

                  <h5>
                    Rahul Sharma
                  </h5>

                  <p>
                    <i className="bi bi-telephone"></i>
                    9876543210
                  </p>

                </div>

                <div className="doctor-appointment-type">
                  <span>
                    General Consultation
                  </span>
                </div>

                <button className="doctor-view-btn">
                  View
                </button>

              </div>


              {/* APPOINTMENT */}

              <div className="doctor-appointment">

                <div className="doctor-appointment-time">
                  <strong>10:30</strong>
                  <span>AM</span>
                </div>

                <div className="doctor-patient-avatar">
                  PS
                </div>

                <div className="doctor-appointment-info">

                  <h5>
                    Priya Singh
                  </h5>

                  <p>
                    <i className="bi bi-telephone"></i>
                    9876501234
                  </p>

                </div>

                <div className="doctor-appointment-type">
                  <span>
                    Follow-up
                  </span>
                </div>

                <button className="doctor-view-btn">
                  View
                </button>

              </div>


              {/* APPOINTMENT */}

              <div className="doctor-appointment">

                <div className="doctor-appointment-time">
                  <strong>12:00</strong>
                  <span>PM</span>
                </div>

                <div className="doctor-patient-avatar">
                  AK
                </div>

                <div className="doctor-appointment-info">

                  <h5>
                    Amit Kumar
                  </h5>

                  <p>
                    <i className="bi bi-telephone"></i>
                    9988776655
                  </p>

                </div>

                <div className="doctor-appointment-type">
                  <span>
                    Consultation
                  </span>
                </div>

                <button className="doctor-view-btn">
                  View
                </button>

              </div>


              {/* APPOINTMENT */}

              <div className="doctor-appointment">

                <div className="doctor-appointment-time">
                  <strong>02:30</strong>
                  <span>PM</span>
                </div>

                <div className="doctor-patient-avatar">
                  NP
                </div>

                <div className="doctor-appointment-info">

                  <h5>
                    Neha Patel
                  </h5>

                  <p>
                    <i className="bi bi-telephone"></i>
                    9898989898
                  </p>

                </div>

                <div className="doctor-appointment-type">
                  <span>
                    Follow-up
                  </span>
                </div>

                <button className="doctor-view-btn">
                  View
                </button>

              </div>

            </section>

          </div>


          {/* ================= QUICK ACTIONS ================= */}

          <div className="col-lg-4">

            <section className="doctor-panel">

              <div className="doctor-panel-header">

                <div>
                  <span>ACTIONS</span>

                  <h3>
                    Quick Actions
                  </h3>
                </div>

              </div>


              <Link
                to="/doctor/appointments"
                className="doctor-action"
              >

                <div>
                  <i className="bi bi-calendar-plus"></i>
                </div>

                <section>
                  <h5>Appointments</h5>
                  <p>Manage today's appointments</p>
                </section>

                <i className="bi bi-arrow-right"></i>

              </Link>


              <Link
                to="/doctor/patients"
                className="doctor-action"
              >

                <div>
                  <i className="bi bi-person-lines-fill"></i>
                </div>

                <section>
                  <h5>My Patients</h5>
                  <p>View your patient list</p>
                </section>

                <i className="bi bi-arrow-right"></i>

              </Link>


              <Link
                to="/doctor/records"
                className="doctor-action"
              >

                <div>
                  <i className="bi bi-file-earmark-medical"></i>
                </div>

                <section>
                  <h5>Medical Records</h5>
                  <p>Review patient records</p>
                </section>

                <i className="bi bi-arrow-right"></i>

              </Link>


              <Link
                to="/doctor/prescriptions"
                className="doctor-action"
              >

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

                <h3>
                  Recent Patients
                </h3>

              </div>

              <Link to="/doctor/patients">
                View All
              </Link>

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

                  <tr>

                    <td>
                      <strong>Rahul Sharma</strong>
                    </td>

                    <td>
                      34
                    </td>

                    <td>
                      Male
                    </td>

                    <td>
                      03 Sep 2026
                    </td>

                    <td>
                      <span className="patient-active">
                        Active
                      </span>
                    </td>

                  </tr>


                  <tr>

                    <td>
                      <strong>Priya Singh</strong>
                    </td>

                    <td>
                      29
                    </td>

                    <td>
                      Female
                    </td>

                    <td>
                      02 Sep 2026
                    </td>

                    <td>
                      <span className="patient-active">
                        Active
                      </span>
                    </td>

                  </tr>


                  <tr>

                    <td>
                      <strong>Amit Kumar</strong>
                    </td>

                    <td>
                      46
                    </td>

                    <td>
                      Male
                    </td>

                    <td>
                      29 Aug 2026
                    </td>

                    <td>
                      <span className="patient-followup">
                        Follow-up
                      </span>
                    </td>

                  </tr>


                  <tr>

                    <td>
                      <strong>Neha Patel</strong>
                    </td>

                    <td>
                      38
                    </td>

                    <td>
                      Female
                    </td>

                    <td>
                      27 Aug 2026
                    </td>

                    <td>
                      <span className="patient-active">
                        Active
                      </span>
                    </td>

                  </tr>

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