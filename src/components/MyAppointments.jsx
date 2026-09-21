import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";


const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/appointments/my-appointments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAppointments(response.data.appointments || []);
      } catch (error) {
        console.error(
          "Error fetching appointments:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "appointment-status-approved";

      case "pending":
        return "appointment-status-pending";

      case "rejected":
        return "appointment-status-rejected";

      case "completed":
        return "appointment-status-completed";

      default:
        return "appointment-status-pending";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="my-appointments-page">

      {/* HEADER */}

      <div className="my-appointments-header">
        <div>
          <span className="page-label">BRAVOS HEALTHCARE</span>

          <h1>My Appointments</h1>

          <p>
            View and manage all your scheduled appointments.
          </p>
        </div>

        <Link to="/appointment" className="book-new-btn">
          <i className="bi bi-calendar-plus"></i>
          Book New Appointment
        </Link>
      </div>


      {/* CONTENT */}

      <div className="my-appointments-content">

        {loading ? (
          <div className="appointments-loading">
            <div className="spinner-border text-primary"></div>

            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (

          <div className="appointments-empty">

            <div className="empty-icon">
              <i className="bi bi-calendar-x"></i>
            </div>

            <h3>No Appointments Found</h3>

            <p>
              You don't have any appointments yet.
            </p>

            <Link
              to="/appointment"
              className="book-new-btn"
            >
              <i className="bi bi-calendar-plus"></i>
              Book an Appointment
            </Link>

          </div>

        ) : (

          <div className="appointments-list">

            {appointments.map((appointment) => (

              <div
                className="my-appointment-card"
                key={appointment._id}
              >

                {/* DATE */}

                <div className="appointment-date-box">

                  <span>
                    {new Date(appointment.date)
                      .toLocaleString("en-US", {
                        month: "short",
                      })
                      .toUpperCase()}
                  </span>

                  <h2>
                    {new Date(appointment.date).getDate()}
                  </h2>

                  <small>
                    {new Date(appointment.date).getFullYear()}
                  </small>

                </div>


                {/* DETAILS */}

                <div className="my-appointment-details">

                  <span className="appointment-department">
                    {appointment.department ||
                      "General Consultation"}
                  </span>

                  <h3>
                    {appointment.doctor?.name ||
                      "Doctor"}
                  </h3>

                  <p className="doctor-specialization">
                    {appointment.doctor?.specialization ||
                      "Medical Specialist"}
                  </p>

                  <div className="appointment-meta">

                    <span>
                      <i className="bi bi-clock"></i>
                      {appointment.time}
                    </span>

                    <span>
                      <i className="bi bi-building"></i>
                      Bravos Hospital
                    </span>

                  </div>

                </div>


                {/* STATUS */}

                <div className="my-appointment-status">

                  <span
                    className={getStatusClass(
                      appointment.status
                    )}
                  >
                    <i
                      className={
                        appointment.status === "approved"
                          ? "bi bi-check-circle-fill"
                          : appointment.status === "completed"
                          ? "bi bi-check2-all"
                          : appointment.status === "rejected"
                          ? "bi bi-x-circle-fill"
                          : "bi bi-clock-fill"
                      }
                    ></i>

                    {formatStatus(
                      appointment.status
                    )}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
};

export default MyAppointments;