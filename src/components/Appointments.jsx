import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../config/api";

const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Appointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedDoctorId = searchParams.get("doctor");
  const selectedDepartment = searchParams.get("department");

  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [formData, setFormData] = useState({
    department: selectedDepartment || "",
    doctor: selectedDoctorId || "",
    date: "",
    time: "",
    message: "",
  });

  const [availability, setAvailability] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const storedPatient = sessionStorage.getItem("patient");

    if (!storedPatient) {
      setPatientLoading(false);
      return;
    }

    try {
      setPatient(JSON.parse(storedPatient));
    } catch (error) {
      console.error("Patient data error:", error);
      sessionStorage.removeItem("patient");
    } finally {
      setPatientLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchDoctors = async () => {
      try {
        const response = await api.get("/api/doctors");
        if (active) setDoctors(response.data.doctors || []);
      } catch (error) {
        console.error(
          "Doctor fetch error:",
          error.response?.data || error.message,
        );
      } finally {
        if (active) setLoadingDoctors(false);
      }
    };

    fetchDoctors();
    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!formData.department) return doctors;
    return doctors.filter(
      (doctor) =>
        doctor.specialization?.trim().toLowerCase() ===
        formData.department.trim().toLowerCase(),
    );
  }, [doctors, formData.department]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (["doctor", "date", "time"].includes(name)) {
      setAvailability(null);
      setAvailabilityMessage("");
    }
  };

  const handleDepartmentChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      department: event.target.value,
      doctor: "",
      date: previous.date,
      time: "",
    }));
    setAvailability(null);
    setAvailabilityMessage("");
  };

  // Check the selected slot whenever doctor, date or time changes.
  useEffect(() => {
    if (!formData.doctor || !formData.date || !formData.time) {
      setAvailability(null);
      setAvailabilityMessage("");
      setCheckingAvailability(false);
      return undefined;
    }

    let active = true;
    const controller = new AbortController();

    const checkAvailability = async () => {
      setCheckingAvailability(true);
      setAvailability(null);
      setAvailabilityMessage("");

      try {
        const response = await api.get("/api/appointments/availability", {
          params: {
            doctor: formData.doctor,
            date: formData.date,
            time: formData.time,
          },
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          signal: controller.signal,
        });

        if (active) {
          setAvailability(response.data.availability);
          setAvailabilityMessage(response.data.message || "");
        }
      } catch (error) {
        if (
          active &&
          error.name !== "CanceledError" &&
          error.code !== "ERR_CANCELED"
        ) {
          setAvailability("not_available");
          setAvailabilityMessage(
            error.response?.data?.message ||
              "Could not verify this slot. Please try again.",
          );
        }
      } finally {
        if (active) setCheckingAvailability(false);
      }
    };

    // Short debounce avoids sending a request for every rapid input change.
    const timer = setTimeout(checkAvailability, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.doctor, formData.date, formData.time]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patient) {
      alert("Please login as a patient before booking an appointment.");
      navigate("/login");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Your login session has expired. Please login again.");
      navigate("/login");
      return;
    }

    if (
      !formData.department ||
      !formData.doctor ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please select department, doctor, date and time.");
      return;
    }

    if (checkingAvailability || !availability) {
      alert("Please wait while we check slot availability.");
      return;
    }

    if (availability === "not_available") {
      alert("This slot is not available. Please select another slot.");
      return;
    }

    try {
      setBooking(true);

      const response = await api.post(
        "/api/appointments",
        {
          department: formData.department,
          doctor: formData.doctor,
          date: formData.date,
          time: formData.time,
          message: formData.message,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert(response.data.message || "Appointment request submitted.");

      setFormData((previous) => ({
        ...previous,
        doctor: "",
        date: "",
        time: "",
        message: "",
      }));
      setAvailability(null);
      setAvailabilityMessage("");
    } catch (error) {
      console.error(
        "Appointment booking error:",
        error.response?.data || error.message,
      );
      alert(error.response?.data?.message || "Unable to book appointment.");
      // Refresh the availability after a booking conflict.
      setAvailability(null);
    } finally {
      setBooking(false);
    }
  };

  if (patientLoading) {
    return (
      <section className="appointment-section py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Loading patient information...</p>
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <>
        <section className="appointment-hero">
          <div className="container text-center">
            <h1>Book an Appointment</h1>
            <p>
              Schedule your visit with our experienced doctors and get the care
              you deserve.
            </p>
          </div>
        </section>
        <section className="appointment-section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="appointment-form text-center">
                  <i
                    className="bi bi-person-lock mb-3"
                    style={{ fontSize: "50px", color: "var(--primary-teal)" }}
                  />
                  <h2>Login Required</h2>
                  <p className="mb-4">
                    Please login as a patient to book an appointment. Your
                    registered patient details will be used automatically.
                  </p>
                  <button
                    className="btn btn-primary appointment-btn"
                    onClick={() => navigate("/login")}
                  >
                    <i className="bi bi-box-arrow-in-right me-2" />
                    Login as Patient
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="appointment-hero">
        <div className="container text-center">
          <h1>Book an Appointment</h1>
          <p>
            Schedule your visit with our experienced doctors and get the care
            you deserve.
          </p>
        </div>
      </section>

      <section className="appointment-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 mb-4">
              <div className="appointment-info h-100">
                <h2>Your Health, Our Priority</h2>
                <p>
                  Book an appointment with our expert doctors quickly and
                  easily.
                </p>

                <div className="info-item">
                  <i className="bi bi-person-circle" />
                  <div>
                    <h5>Patient</h5>
                    <p>{patient.name || "—"}</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bi bi-telephone-fill" />
                  <div>
                    <h5>Phone</h5>
                    <p>{patient.phone || "—"}</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bi bi-envelope-fill" />
                  <div>
                    <h5>Email</h5>
                    <p>{patient.email || "—"}</p>
                  </div>
                </div>
                <div className="info-item">
                  <i className="bi bi-clock-fill" />
                  <div>
                    <h5>Working Hours</h5>
                    <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="appointment-form">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="mb-2">Schedule Your Appointment</h2>
                    <p className="text-muted mb-4">
                      Your registered patient information has been filled
                      automatically.
                    </p>
                  </div>
                  <div>
                    <Link
                      to="/patient-dashboard"
                      className="back-dashboard-btn"
                    >
                      <i className="bi bi-arrow-left"></i>
                    </Link>
                  </div>
                </div>

                <div
                  className="p-3 rounded mb-4"
                  style={{
                    background: "#f0f8f8",
                    borderLeft: "4px solid var(--primary-teal)",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-check me-2" />
                    <strong>Patient information</strong>
                    <span className="ms-2 text-muted">
                      Automatically filled from your account
                    </span>
                  </div>
                  <div className="row mt-2">
                    <div className="col-md-6">
                      <small className="text-muted">Name</small>
                      <div>{patient.name || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Email</small>
                      <div>{patient.email || "—"}</div>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Phone</small>
                      <div>{patient.phone || "—"}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Age</small>
                      <div>{patient.age || "—"}</div>
                    </div>
                    <div className="col-md-3">
                      <small className="text-muted">Gender</small>
                      <div>{patient.gender || "—"}</div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">
                          General Medicine
                        </option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Select Doctor</label>
                      <select
                        className="form-select"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        required
                        disabled={loadingDoctors || !formData.department}
                      >
                        <option value="">
                          {loadingDoctors
                            ? "Loading Doctors..."
                            : !formData.department
                              ? "Select Department First"
                              : filteredDoctors.length === 0
                                ? "No Doctors Available"
                                : "Select Doctor"}
                        </option>
                        {filteredDoctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Appointment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={getLocalDateString()}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Preferred Time</label>
                      <select
                        className="form-select"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Time</option>
                        {[
                          "09:00 AM",
                          "10:00 AM",
                          "11:00 AM",
                          "12:00 PM",
                          "02:00 PM",
                          "03:00 PM",
                          "04:00 PM",
                          "05:00 PM",
                        ].map((time) => (
                          <option value={time} key={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.doctor && formData.date && formData.time && (
                      <div className="col-12 mb-3" aria-live="polite">
                        {checkingAvailability && (
                          <div className="alert alert-info mb-0">
                            <span className="spinner-border spinner-border-sm me-2" />
                            Checking slot availability...
                          </div>
                        )}

                        {!checkingAvailability &&
                          availability === "available" && (
                            <div className="alert alert-success mb-0">
                              <strong>Available:</strong>{" "}
                              {availabilityMessage ||
                                "You can book this appointment."}
                              <div className="small mt-1">
                                Your booking will be confirmed immediately.
                              </div>
                            </div>
                          )}

                        {!checkingAvailability &&
                          availability === "waiting" && (
                            <div className="alert alert-warning mb-0">
                              <strong>Waiting list:</strong>{" "}
                              {availabilityMessage ||
                                "The confirmed capacity is full. You can join the waiting list."}
                              <div className="small mt-1">
                                Your booking will not be confirmed until a place
                                becomes available.
                              </div>
                            </div>
                          )}

                        {!checkingAvailability &&
                          availability === "not_available" && (
                            <div className="alert alert-danger mb-0">
                              <strong>Not available:</strong>{" "}
                              {availabilityMessage ||
                                "Please select another date or time."}
                            </div>
                          )}
                      </div>
                    )}

                    <div className="col-12 mb-4">
                      <label className="form-label">
                        Symptoms / Additional Message
                      </label>
                      <textarea
                        className="form-control"
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Briefly describe your symptoms..."
                      />
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary appointment-btn"
                        disabled={
                          booking ||
                          checkingAvailability ||
                          !availability ||
                          availability === "not_available"
                        }
                      >
                        {booking ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Booking...
                          </>
                        ) : availability === "waiting" ? (
                          <>
                            <i className="bi bi-hourglass-split me-2" />
                            Join Waiting List
                          </>
                        ) : (
                          <>
                            <i className="bi bi-calendar-check me-2" />
                            Confirm Appointment
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Appointment;
