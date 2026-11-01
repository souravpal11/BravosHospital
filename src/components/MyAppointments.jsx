import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";

const appointmentTimestamp = (appointment) => {
  const date = appointment?.date || "";
  const match = String(appointment?.time || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !match) return new Date(appointment?.createdAt || 0).getTime();
  let hours = Number(match[1]);
  if (match[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (match[3].toUpperCase() === "AM" && hours === 12) hours = 0;
  return new Date(`${date}T${String(hours).padStart(2, "0")}:${match[2]}:00+05:30`).getTime();
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get(
          "/api/appointments/my-appointments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedAppointments = response.data.appointments || [];
        fetchedAppointments.sort((a, b) =>
          appointmentTimestamp(b) - appointmentTimestamp(a) ||
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setAppointments(fetchedAppointments);
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

                  {appointment.status === "cancelled" &&
                    (appointment.cancelledBy === "admin" ||
                      (appointment.cancellationReason || "").toLowerCase().includes("doctor time blocked")) && (
                      <div className="alert alert-warning mt-2 mb-0 py-2" role="status">
                        Your appointment is canceled by the admin because the doctor is unavailable
                      </div>
                    )}

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