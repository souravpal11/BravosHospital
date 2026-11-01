// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../config/api";


// const MyAppointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = sessionStorage.getItem("token");

//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const response = await api.get(
//           "/api/appointments/my-appointments",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setAppointments(response.data.appointments || []);
//       } catch (error) {
//         console.error(
//           "Error fetching appointments:",
//           error.response?.data || error.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAppointments();
//   }, [token]);

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "approved":
//         return "appointment-status-approved";

//       case "pending":
//         return "appointment-status-pending";

//       case "rejected":
//         return "appointment-status-rejected";

//       case "completed":
//         return "appointment-status-completed";

//       default:
//         return "appointment-status-pending";
//     }
//   };

//   const formatStatus = (status) => {
//     if (!status) return "Pending";

//     return status.charAt(0).toUpperCase() + status.slice(1);
//   };

//   return (
//     <div className="my-appointments-page">

//       {/* HEADER */}

//       <div className="my-appointments-header">
//         <div>
//           <span className="page-label">BRAVOS HEALTHCARE</span>

//           <h1>My Appointments</h1>

//           <p>
//             View and manage all your scheduled appointments.
//           </p>
//         </div>

//         <Link to="/appointment" className="book-new-btn">
//           <i className="bi bi-calendar-plus"></i>
//           Book New Appointment
//         </Link>
//       </div>


//       {/* CONTENT */}

//       <div className="my-appointments-content">

//         {loading ? (
//           <div className="appointments-loading">
//             <div className="spinner-border text-primary"></div>

//             <p>Loading your appointments...</p>
//           </div>
//         ) : appointments.length === 0 ? (

//           <div className="appointments-empty">

//             <div className="empty-icon">
//               <i className="bi bi-calendar-x"></i>
//             </div>

//             <h3>No Appointments Found</h3>

//             <p>
//               You don't have any appointments yet.
//             </p>

//             <Link
//               to="/appointment"
//               className="book-new-btn"
//             >
//               <i className="bi bi-calendar-plus"></i>
//               Book an Appointment
//             </Link>

//           </div>

//         ) : (

//           <div className="appointments-list">

//             {appointments.map((appointment) => (

//               <div
//                 className="my-appointment-card"
//                 key={appointment._id}
//               >

//                 {/* DATE */}

//                 <div className="appointment-date-box">

//                   <span>
//                     {new Date(appointment.date)
//                       .toLocaleString("en-US", {
//                         month: "short",
//                       })
//                       .toUpperCase()}
//                   </span>

//                   <h2>
//                     {new Date(appointment.date).getDate()}
//                   </h2>

//                   <small>
//                     {new Date(appointment.date).getFullYear()}
//                   </small>

//                 </div>


//                 {/* DETAILS */}

//                 <div className="my-appointment-details">

//                   <span className="appointment-department">
//                     {appointment.department ||
//                       "General Consultation"}
//                   </span>

//                   <h3>
//                     {appointment.doctor?.name ||
//                       "Doctor"}
//                   </h3>

//                   <p className="doctor-specialization">
//                     {appointment.doctor?.specialization ||
//                       "Medical Specialist"}
//                   </p>

//                   <div className="appointment-meta">

//                     <span>
//                       <i className="bi bi-clock"></i>
//                       {appointment.time}
//                     </span>

//                     <span>
//                       <i className="bi bi-building"></i>
//                       Bravos Hospital
//                     </span>

//                   </div>

//                 </div>


//                 {/* STATUS */}

//                 <div className="my-appointment-status">

//                   <span
//                     className={getStatusClass(
//                       appointment.status
//                     )}
//                   >
//                     <i
//                       className={
//                         appointment.status === "approved"
//                           ? "bi bi-check-circle-fill"
//                           : appointment.status === "completed"
//                           ? "bi bi-check2-all"
//                           : appointment.status === "rejected"
//                           ? "bi bi-x-circle-fill"
//                           : "bi bi-clock-fill"
//                       }
//                     ></i>

//                     {formatStatus(
//                       appointment.status
//                     )}
//                   </span>

//                 </div>

//               </div>

//             ))}

//           </div>

//         )}

//       </div>

//     </div>
//   );
// };

// export default MyAppointments;


import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";

// Appointment date and time are interpreted as Indian Standard Time (IST).
const getAppointmentDateTime = (date, time) => {
  if (!date || !time) return null;

  const dateMatch = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = String(time).trim().toUpperCase().match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/
  );

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const modifier = timeMatch[3];

  if (month < 1 || month > 12 || day < 1 || day > 31 || minutes > 59) {
    return null;
  }

  if (modifier) {
    if (hours < 1 || hours > 12) return null;
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  const calendarCheck = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarCheck.getUTCFullYear() !== year ||
    calendarCheck.getUTCMonth() !== month - 1 ||
    calendarCheck.getUTCDate() !== day
  ) {
    return null;
  }

  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes) - 330 * 60 * 1000
  );
};

const formatAppointmentDate = (date) => {
  if (!date) return "—";
  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;

  const [, year, month, day] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return {
    month: parsed.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    day: parsed.getUTCDate(),
    year: parsed.getUTCFullYear(),
  };
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = sessionStorage.getItem("token");

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setAppointments([]);
      setLoading(false);
      setError("Please login to view your appointments.");
      return;
    }

    try {
      setError("");
      const response = await api.get("/api/appointments/my-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data.appointments || []);
    } catch (requestError) {
      console.error("Error fetching appointments:", requestError.response?.data || requestError.message);
      setError(requestError.response?.data?.message || "Unable to load your appointments.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const canCancelAppointment = (appointment) => {
    if (!["approved", "waiting"].includes(appointment.status)) return false;
    if (["in_consultation", "completed"].includes(appointment.attendanceStatus)) return false;

    const scheduledDateTime = getAppointmentDateTime(appointment.date, appointment.time);
    if (!scheduledDateTime) return false;

    const remainingMilliseconds = scheduledDateTime.getTime() - Date.now();
    return remainingMilliseconds >= 2 * 60 * 60 * 1000;
  };

  const getCancellationMessage = (appointment) => {
    if (appointment.status === "cancelled") return "This appointment has been cancelled.";
    if (appointment.status === "completed" || appointment.attendanceStatus === "completed") {
      return "This appointment is completed.";
    }
    if (appointment.attendanceStatus === "in_consultation") {
      return "Consultation has already started.";
    }
    if (canCancelAppointment(appointment)) {
      const scheduled = getAppointmentDateTime(appointment.date, appointment.time);
      const hoursLeft = Math.floor((scheduled.getTime() - Date.now()) / 3600000);
      return `Cancellation is available until 2 hours before your appointment. Approximately ${hoursLeft} hour(s) remain.`;
    }
    return "Cancellation is closed because fewer than 2 hours remain before the appointment.";
  };

  const handleCancel = async (appointmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setCancellingId(appointmentId);
      setError("");
      setNotice("");

      const response = await api.patch(
        `/api/appointments/${appointmentId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotice(response.data.message || "Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to cancel this appointment."
      );
    } finally {
      setCancellingId("");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved": return "appointment-status-approved";
      case "waiting": return "appointment-status-pending";
      case "cancelled": return "appointment-status-rejected";
      case "completed": return "appointment-status-completed";
      default: return "appointment-status-pending";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="my-appointments-page">
      <div className="my-appointments-header">
        <div>
          <span className="page-label">BRAVOS HEALTHCARE</span>
          <h1>My Appointments</h1>
          <p>View and manage all your scheduled appointments.</p>
        </div>
        <Link to="/appointment" className="book-new-btn">
          <i className="bi bi-calendar-plus" /> Book New Appointment
        </Link>
      </div>

      <div className="my-appointments-content">
        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        {loading ? (
          <div className="appointments-loading">
            <div className="spinner-border text-primary" />
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="appointments-empty">
            <div className="empty-icon"><i className="bi bi-calendar-x" /></div>
            <h3>No Appointments Found</h3>
            <p>You don't have any appointments yet.</p>
            <Link to="/appointment" className="book-new-btn">
              <i className="bi bi-calendar-plus" /> Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment) => {
              const dateParts = formatAppointmentDate(appointment.date);
              const canCancel = canCancelAppointment(appointment);

              return (
                <div className="my-appointment-card" key={appointment._id}>
                  <div className="appointment-date-box">
                    {typeof dateParts === "string" ? (
                      <><span>DATE</span><h2>—</h2><small>{dateParts}</small></>
                    ) : (
                      <>
                        <span>{dateParts.month}</span>
                        <h2>{dateParts.day}</h2>
                        <small>{dateParts.year}</small>
                      </>
                    )}
                  </div>

                  <div className="my-appointment-details">
                    <span className="appointment-department">
                      {appointment.department || "General Consultation"}
                    </span>
                    <h3>{appointment.doctor?.name || "Doctor"}</h3>
                    <p className="doctor-specialization">
                      {appointment.doctor?.specialization || "Medical Specialist"}
                    </p>
                    <div className="appointment-meta">
                      <span><i className="bi bi-clock" /> {appointment.time}</span>
                      <span><i className="bi bi-building" /> Bravos Hospital</span>
                    </div>
                    <div className="small text-muted mt-2">
                      Attendance: {formatStatus(appointment.attendanceStatus || "not_arrived")}
                    </div>
                  </div>

                  <div className="my-appointment-status">
                    <span className={getStatusClass(appointment.status)}>
                      <i
                        className={
                          appointment.status === "approved"
                            ? "bi bi-check-circle-fill"
                            : appointment.status === "completed"
                            ? "bi bi-check2-all"
                            : appointment.status === "cancelled"
                            ? "bi bi-x-circle-fill"
                            : "bi bi-clock-fill"
                        }
                      />
                      {formatStatus(appointment.status)}
                    </span>

                    {canCancel ? (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-3"
                        disabled={cancellingId === appointment._id}
                        onClick={() => handleCancel(appointment._id)}
                      >
                        {cancellingId === appointment._id ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    ) : (
                      <p className="small text-muted mt-3 mb-0">
                        {getCancellationMessage(appointment)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
