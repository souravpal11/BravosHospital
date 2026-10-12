import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/api";

const Appointment = () => {
  // ==========================================
  // URL PARAMETERS
  // ==========================================

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedDoctorId = searchParams.get("doctor");
  const selectedDepartment = searchParams.get("department");

  // ==========================================
  // LOGGED-IN PATIENT
  // ==========================================

  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    department: selectedDepartment || "",
    doctor: selectedDoctorId || "",
    date: "",
    time: "",
    message: "",
  });

  // ==========================================
  // DOCTORS
  // ==========================================

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // ==========================================
  // LOAD LOGGED-IN PATIENT
  // ==========================================

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");

    if (!storedPatient) {
      setPatientLoading(false);
      return;
    }

    try {
      const patientData = JSON.parse(storedPatient);

      setPatient(patientData);

      // Automatically fill patient details
      setFormData((prev) => ({
        ...prev,
        name: patientData.name || "",
        email: patientData.email || "",
        phone: patientData.phone || "",
        age: patientData.age || "",
        gender: patientData.gender || "",
      }));
    } catch (error) {
      console.error("Patient Data Error:", error);
      localStorage.removeItem("patient");
    } finally {
      setPatientLoading(false);
    }
  }, []);

  // ==========================================
  // FETCH DOCTORS
  // ==========================================

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get(
          "/api/doctors"
        );

        console.log("Doctors:", response.data);

        setDoctors(response.data.doctors || []);
      } catch (error) {
        console.error("Doctor Fetch Error:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE DEPARTMENT CHANGE
  // ==========================================

  const handleDepartmentChange = (e) => {
    const department = e.target.value;

    setFormData((prev) => ({
      ...prev,
      department,
      doctor: "",
    }));
  };

  // ==========================================
  // FILTER DOCTORS
  // ==========================================

  const filteredDoctors = doctors.filter((doctor) => {
    if (!formData.department) {
      return true;
    }

    return (
      doctor.specialization?.trim().toLowerCase() ===
      formData.department.trim().toLowerCase()
    );
  });

  // ==========================================
  // BOOK APPOINTMENT
  // ==========================================

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Check patient login
  if (!patient) {
    alert("Please login as a patient before booking an appointment.");
    navigate("/login");
    return;
  }

  // Get JWT token
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Your login session has expired. Please login again.");
    navigate("/login");
    return;
  }

  try {
    // Only send appointment-related information
    const appointmentData = {
      department: formData.department,
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
      message: formData.message,
    };

    const response = await api.post(
      "/api/appointments",
      appointmentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert(response.data.message);

    // Reset appointment fields
    setFormData((prev) => ({
      ...prev,
      department: "",
      doctor: "",
      date: "",
      time: "",
      message: "",
    }));

  } catch (error) {
    console.error(
      "Appointment Error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Unable to book appointment"
    );
  }
};

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!patientLoading && !patient) {
    return (
      <>
        <section className="appointment-hero">
          <div className="container text-center">
            <h1>Book an Appointment</h1>

            <p>
              Schedule your visit with our experienced doctors
              and get the care you deserve.
            </p>
          </div>
        </section>

        <section className="appointment-section py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="appointment-form text-center">

                  <div className="mb-3">
                    <i
                      className="bi bi-person-lock"
                      style={{
                        fontSize: "50px",
                        color: "var(--primary-teal)",
                      }}
                    ></i>
                  </div>

                  <h2>Login Required</h2>

                  <p className="mb-4">
                    Please login as a patient to book an
                    appointment. Your registered patient details
                    will be filled automatically.
                  </p>

                  <button
                    className="btn btn-primary appointment-btn"
                    onClick={() => navigate("/login")}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
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
      {/* =================================================
          HERO
      ================================================= */}

      <section className="appointment-hero">
        <div className="container text-center">
          <h1>Book an Appointment</h1>

          <p>
            Schedule your visit with our experienced doctors
            and get the care you deserve.
          </p>
        </div>
      </section>

      {/* =================================================
          APPOINTMENT FORM
      ================================================= */}

      <section className="appointment-section py-5">
        <div className="container">
          <div className="row justify-content-center">

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="col-lg-4 mb-4">
              <div className="appointment-info h-100">

                <h2>Your Health, Our Priority</h2>

                <p>
                  Book an appointment with our expert doctors
                  quickly and easily.
                </p>

                <div className="info-item">
                  <i className="bi bi-person-circle"></i>

                  <div>
                    <h5>Patient</h5>
                    <p>{patient?.name}</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="bi bi-telephone-fill"></i>

                  <div>
                    <h5>Phone</h5>
                    <p>{patient?.phone}</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="bi bi-envelope-fill"></i>

                  <div>
                    <h5>Email</h5>
                    <p>{patient?.email}</p>
                  </div>
                </div>

                <div className="info-item">
                  <i className="bi bi-clock-fill"></i>

                  <div>
                    <h5>Working Hours</h5>
                    <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="col-lg-8">
              <div className="appointment-form">

                <h2 className="mb-2">
                  Schedule Your Appointment
                </h2>

                <p className="text-muted mb-4">
                  Your registered patient information has been
                  filled automatically.
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="row">

                    {/* =================================================
                        PATIENT INFORMATION
                    ================================================= */}

                    <div className="col-12 mb-3">
                      <div
                        className="p-3 rounded"
                        style={{
                          background: "#f0f8f8",
                          borderLeft:
                            "4px solid var(--primary-teal)",
                        }}
                      >
                        <div className="d-flex align-items-center">
                          <i className="bi bi-shield-check me-2"></i>

                          <strong>
                            Patient information
                          </strong>

                          <span className="ms-2 text-muted">
                            Automatically filled from your account
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* NAME */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        readOnly
                        required
                      />
                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email Address
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        readOnly
                        required
                      />
                    </div>

                    {/* PHONE */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        readOnly
                        required
                      />
                    </div>

                    {/* AGE */}

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Age
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        readOnly
                        required
                      />
                    </div>

                    {/* GENDER */}

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Gender
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        readOnly
                        required
                      />
                    </div>

                    {/* =================================================
                        DEPARTMENT
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Department
                      </label>

                      <select
                        className="form-select"
                        name="department"
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        required
                      >
                        <option value="">
                          Select Department
                        </option>

                        <option value="Cardiology">
                          Cardiology
                        </option>

                        <option value="Neurology">
                          Neurology
                        </option>

                        <option value="Orthopedics">
                          Orthopedics
                        </option>

                        <option value="Dermatology">
                          Dermatology
                        </option>

                        <option value="General Medicine">
                          General Medicine
                        </option>

                        <option value="Pediatrics">
                          Pediatrics
                        </option>
                      </select>
                    </div>

                    {/* =================================================
                        DOCTOR
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Select Doctor
                      </label>

                      <select
                        className="form-select"
                        name="doctor"
                        value={formData.doctor}
                        onChange={handleChange}
                        required
                        disabled={
                          loadingDoctors ||
                          !formData.department
                        }
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
                          <option
                            key={doctor._id}
                            value={doctor._id}
                          >
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* =================================================
                        DATE
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Appointment Date
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        required
                      />
                    </div>

                    {/* =================================================
                        TIME
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Preferred Time
                      </label>

                      <select
                        className="form-select"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select Time
                        </option>

                        <option value="09:00 AM">
                          09:00 AM
                        </option>

                        <option value="10:00 AM">
                          10:00 AM
                        </option>

                        <option value="11:00 AM">
                          11:00 AM
                        </option>

                        <option value="12:00 PM">
                          12:00 PM
                        </option>

                        <option value="02:00 PM">
                          02:00 PM
                        </option>

                        <option value="03:00 PM">
                          03:00 PM
                        </option>

                        <option value="04:00 PM">
                          04:00 PM
                        </option>

                        <option value="05:00 PM">
                          05:00 PM
                        </option>
                      </select>
                    </div>

                    {/* =================================================
                        MESSAGE
                    ================================================= */}

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
                      ></textarea>
                    </div>

                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary appointment-btn"
                      >
                        <i className="bi bi-calendar-check me-2"></i>
                        Confirm Appointment
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