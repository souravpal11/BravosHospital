
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/appointments";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const readStoredObject = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const getDoctorId = (appointment) => {
  if (!appointment?.doctor) return "";

  return typeof appointment.doctor === "object"
    ? appointment.doctor._id || appointment.doctor.id || ""
    : appointment.doctor;
};

const getDoctorName = (appointment) => {
  if (!appointment?.doctor) return "Doctor not assigned";

  return typeof appointment.doctor === "object"
    ? appointment.doctor.name || "Doctor"
    : "Doctor";
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const AppointmentQueue = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const loggedInDoctor = readStoredObject("doctor");

  const loggedInDoctorId =
    loggedInDoctor?._id || loggedInDoctor?.id || "";

  const [appointments, setAppointments] = useState([]);
  const [queue, setQueue] = useState([]);

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedDoctor, setSelectedDoctor] = useState(
    role === "doctor" ? loggedInDoctorId : ""
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);

  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ==========================================
  // AUTH CONFIG
  // ==========================================

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  // ==========================================
  // FETCH APPOINTMENTS
  // ==========================================

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setError("Your session is missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API, authConfig);

      const items = response.data.appointments || [];

      setAppointments(items);

      if (role === "doctor") {
        setSelectedDoctor(loggedInDoctorId);
      } else if (role === "admin" && !selectedDoctor && items.length) {
        const firstDoctorId = getDoctorId(items[0]);

        if (firstDoctorId) {
          setSelectedDoctor(firstDoctorId);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load appointments. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    authConfig,
    role,
    loggedInDoctorId,
    selectedDoctor,
  ]);

  // ==========================================
  // FETCH PATIENT QUEUE
  // ==========================================

  const fetchQueue = useCallback(async () => {
    if (!token || !selectedDoctor || !selectedDate) {
      setQueue([]);
      return;
    }

    try {
      setQueueLoading(true);

      const response = await axios.get(`${API}/queue`, {
        ...authConfig,
        params: {
          doctor: selectedDoctor,
          date: selectedDate,
        },
      });

      setQueue(response.data.queue || []);
    } catch (err) {
      setQueue([]);

      setError(
        err.response?.data?.message ||
          "Could not load the patient queue."
      );
    } finally {
      setQueueLoading(false);
    }
  }, [token, selectedDoctor, selectedDate, authConfig]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // ==========================================
  // REFRESH DATA
  // ==========================================

  const refreshData = async () => {
    await fetchAppointments();
    await fetchQueue();
  };

  // ==========================================
  // PERFORM APPOINTMENT ACTIONS
  // ==========================================

  const performAction = async (appointmentId, action) => {
    try {
      setBusyId(appointmentId);
      setError("");
      setNotice("");

      let response;

      if (action === "check-in") {
        if (role !== "admin") {
          throw new Error("Only admin can check in patients.");
        }

        response = await axios.patch(
          `${API}/${appointmentId}/check-in`,
          {},
          authConfig
        );
      }

      if (action === "start") {
        if (role !== "doctor") {
          throw new Error("Only doctors can start consultations.");
        }

        response = await axios.patch(
          `${API}/${appointmentId}/start-consultation`,
          {},
          authConfig
        );
      }

      if (action === "complete") {
        if (role !== "doctor") {
          throw new Error("Only doctors can complete consultations.");
        }

        response = await axios.patch(
          `${API}/${appointmentId}/complete-consultation`,
          {},
          authConfig
        );
      }

      setNotice(
        response?.data?.message || "Appointment updated successfully."
      );

      await fetchAppointments();
      await fetchQueue();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Action failed. Please try again."
      );
    } finally {
      setBusyId("");
    }
  };

  // ==========================================
  // DOCTOR OPTIONS
  // ==========================================

  const doctorOptions = useMemo(() => {
    const uniqueDoctors = new Map();

    appointments.forEach((appointment) => {
      const id = getDoctorId(appointment);

      if (id) {
        uniqueDoctors.set(id, {
          id,
          name: getDoctorName(appointment),
        });
      }
    });

    return Array.from(uniqueDoctors.values());
  }, [appointments]);

  // ==========================================
  // FILTER APPOINTMENTS
  // ==========================================

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesDate = appointment.date === selectedDate;

      const matchesDoctor =
        !selectedDoctor ||
        getDoctorId(appointment) === selectedDoctor;

      const matchesSearch =
        !term ||
        (appointment.name || "").toLowerCase().includes(term) ||
        (appointment.phone || "").toLowerCase().includes(term) ||
        (appointment.email || "").toLowerCase().includes(term);

      return matchesDate && matchesDoctor && matchesSearch;
    });
  }, [
    appointments,
    selectedDate,
    selectedDoctor,
    search,
  ]);

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const availableCount = filteredAppointments.filter(
    (item) => item.attendanceStatus === "available"
  ).length;

  const consultationCount = filteredAppointments.filter(
    (item) => item.attendanceStatus === "in_consultation"
  ).length;

  const approvedCount = filteredAppointments.filter(
    (item) => item.status === "approved"
  ).length;

  // ==========================================
  // STATUS LABELS
  // ==========================================

  const attendanceLabel = (status) => {
    const labels = {
      not_arrived: "Not arrived",
      available: "Available",
      in_consultation: "In consultation",
      completed: "Completed",
      no_show: "No show",
    };

    return labels[status] || status || "Not arrived";
  };

  const attendanceClass = (status) => {
    const classes = {
      not_arrived: "bg-secondary-subtle text-secondary",
      available: "bg-success-subtle text-success",
      in_consultation: "bg-primary-subtle text-primary",
      completed: "bg-dark-subtle text-dark",
      no_show: "bg-danger-subtle text-danger",
    };

    return classes[status] || "bg-secondary-subtle text-secondary";
  };

  // ==========================================
  // ACCESS CONTROL
  // ==========================================

  if (role !== "admin" && role !== "doctor") {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          This page is available only to administrators and doctors.

          <div className="mt-3">
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="appointment-queue-page">

      {/* HEADER */}

      <div className="aq-header">
        <div>
          <span className="aq-eyebrow">BRAVOS HOSPITAL</span>

          <h1 className="aq-title">
            Appointment & Queue Management
          </h1>

          <p className="aq-subtitle">
            Check in patients and manage consultations by arrival order.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={refreshData}
            disabled={loading || queueLoading}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>

          <Link
            to={
              role === "admin"
                ? "/admin-dashboard"
                : "/doctor-dashboard"
            }
            className="btn btn-outline-primary"
          >
            <i className="bi bi-grid me-2"></i>
            Dashboard
          </Link>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="alert alert-danger alert-dismissible">
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {notice && (
        <div className="alert alert-success alert-dismissible">
          {notice}

          <button
            type="button"
            className="btn-close"
            onClick={() => setNotice("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* FILTERS */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Appointment date
              </label>

              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Doctor
              </label>

              <select
                className="form-select"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                disabled={role === "doctor"}
              >
                <option value="">Select a doctor</option>

                {doctorOptions.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}

                {role === "doctor" &&
                  loggedInDoctorId &&
                  !doctorOptions.some(
                    (doctor) => doctor.id === loggedInDoctorId
                  ) && (
                    <option value={loggedInDoctorId}>
                      {loggedInDoctor?.name || "My appointments"}
                    </option>
                  )}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Search patient
              </label>

              <input
                type="search"
                className="form-control"
                placeholder="Name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="row g-3 mb-4">

        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Appointments</div>
              <div className="fs-2 fw-bold">
                {filteredAppointments.length}
              </div>
              <i className="bi bi-calendar-check text-primary"></i>
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Approved</div>
              <div className="fs-2 fw-bold">{approvedCount}</div>
              <i className="bi bi-check-circle text-success"></i>
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">Available</div>
              <div className="fs-2 fw-bold">{availableCount}</div>
              <i className="bi bi-person-check text-success"></i>
            </div>
          </div>
        </div>

        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small">In consultation</div>
              <div className="fs-2 fw-bold">{consultationCount}</div>
              <i className="bi bi-heart-pulse text-primary"></i>
            </div>
          </div>
        </div>

      </div>

      {/* PATIENT QUEUE */}

      <div className="aq-panel mb-4">

        <div className="aq-panel-header">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <h2 className="aq-panel-title">
                Patient Arrival Queue
              </h2>

              <p className="aq-panel-description">
                Patients are ordered by recorded check-in time.
              </p>
            </div>

            <span className="badge text-bg-success">
              {queue.length} checked in
            </span>
          </div>
        </div>

        <div className="aq-panel-body">

          {!selectedDoctor ? (
            <div className="alert alert-info mb-0">
              Select a doctor to view the queue.
            </div>
          ) : queueLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success"></div>
              <div className="text-muted mt-2">
                Loading queue...
              </div>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-people fs-1 text-muted"></i>
              <h3 className="h6 mt-2">
                No checked-in patients
              </h3>
              <p className="text-muted mb-0">
                Approved patients will appear here after check-in.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Queue</th>
                    <th>Patient</th>
                    <th>Appointment time</th>
                    <th>Arrival time</th>
                    <th>Attendance</th>
                  </tr>
                </thead>

                <tbody>
                  {queue.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className="badge rounded-pill text-bg-primary fs-6">
                          #{item.priority}
                        </span>
                      </td>

                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        <small className="text-muted">
                          {item.phone}
                        </small>
                      </td>

                      <td>{item.time || "—"}</td>

                      <td>
                        {item.checkedInAt
                          ? new Date(item.checkedInAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`badge ${attendanceClass(
                            item.attendanceStatus
                          )}`}
                        >
                          {attendanceLabel(item.attendanceStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

      {/* APPOINTMENT LIST */}

      <div className="card border-0 shadow-sm">

        <div className="card-header bg-white border-0 pt-4 px-4">
          <h2 className="h5 fw-bold mb-1">
            Appointments
          </h2>

          <p className="text-muted small mb-0">
            Manage patient check-in and consultations.
          </p>
        </div>

        <div className="card-body px-4">

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success"></div>
              <p className="text-muted mt-2 mb-0">
                Loading appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-muted"></i>

              <h3 className="h6 mt-3">
                No appointments found
              </h3>

              <p className="text-muted mb-0">
                Try another date, doctor, or search term.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">

                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time</th>
                    <th>Booking status</th>
                    <th>Attendance</th>
                    <th style={{ minWidth: "260px" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map((appointment) => {
                    const attendance =
                      appointment.attendanceStatus || "not_arrived";

                    const isBusy = busyId === appointment._id;
                    const isApproved = appointment.status === "approved";

                    return (
                      <tr key={appointment._id}>

                        <td>
                          <div className="fw-semibold">
                            {appointment.name}
                          </div>

                          <small className="text-muted">
                            {appointment.phone}
                          </small>
                        </td>

                        <td>{getDoctorName(appointment)}</td>

                        <td>{appointment.time}</td>

                        <td>
                          <span
                            className={`badge ${
                              appointment.status === "approved"
                                ? "bg-success-subtle text-success"
                                : appointment.status === "waiting"
                                ? "bg-warning-subtle text-warning-emphasis"
                                : appointment.status === "completed"
                                ? "bg-dark-subtle text-dark"
                                : "bg-secondary-subtle text-secondary"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${attendanceClass(attendance)}`}
                          >
                            {attendanceLabel(attendance)}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex flex-wrap gap-2">

                            {/* ADMIN ONLY: CHECK IN */}

                            {role === "admin" &&
                              isApproved &&
                              attendance === "not_arrived" && (
                                <button
                                  className="btn btn-sm btn-success"
                                  disabled={isBusy}
                                  onClick={() =>
                                    performAction(
                                      appointment._id,
                                      "check-in"
                                    )
                                  }
                                >
                                  {isBusy
                                    ? "Please wait..."
                                    : "Mark Available"}
                                </button>
                              )}

                            {/* DOCTOR ONLY: START */}

                            {role === "doctor" &&
                              isApproved &&
                              attendance === "available" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  disabled={isBusy}
                                  onClick={() =>
                                    performAction(
                                      appointment._id,
                                      "start"
                                    )
                                  }
                                >
                                  {isBusy
                                    ? "Please wait..."
                                    : "Start Consultation"}
                                </button>
                              )}

                            {/* DOCTOR ONLY: COMPLETE */}

                            {role === "doctor" &&
                              isApproved &&
                              attendance === "in_consultation" && (
                                <button
                                  className="btn btn-sm btn-dark"
                                  disabled={isBusy}
                                  onClick={() =>
                                    performAction(
                                      appointment._id,
                                      "complete"
                                    )
                                  }
                                >
                                  {isBusy
                                    ? "Please wait..."
                                    : "Complete Consultation"}
                                </button>
                              )}

                            {appointment.status === "waiting" && (
                              <span className="small text-muted">
                                Waiting for confirmation
                              </span>
                            )}

                            {appointment.status === "cancelled" && (
                              <span className="small text-muted">
                                Cancelled
                              </span>
                            )}

                            {appointment.status === "completed" && (
                              <span className="small text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Completed
                              </span>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default AppointmentQueue;
