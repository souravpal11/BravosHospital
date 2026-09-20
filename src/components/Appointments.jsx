import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const Appointment = () => {
  // ==========================================
  // URL PARAMETERS
  // ==========================================

  const [searchParams] = useSearchParams();

  const selectedDoctorId = searchParams.get("doctor");
  const selectedDepartment = searchParams.get("department");

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
  // DOCTORS FROM DATABASE
  // ==========================================

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // ==========================================
  // FETCH DOCTORS
  // ==========================================

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/doctors"
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
  // HANDLE INPUT CHANGE
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
      department: department,
      doctor: "",
    }));
  };

  // ==========================================
  // FILTER DOCTORS BY DEPARTMENT
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

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments",
        formData
      );

      alert(response.data.message);

      // Reset form after successful booking
      setFormData({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        department: "",
        doctor: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      console.error("Appointment Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to book appointment"
      );
    }
  };

  return (
    <>
      {/* =================================================
          HERO
      ================================================= */}

      <section className="appointment-hero">
        <div className="container text-center">
          <h1>Book an Appointment</h1>

          <p>
            Schedule your visit with our experienced doctors and get the care
            you deserve.
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
                  Book an appointment with our expert doctors quickly and
                  easily.
                </p>

                {/* Emergency */}

                <div className="info-item">
                  <i className="bi bi-telephone-fill"></i>

                  <div>
                    <h5>Emergency Call</h5>
                    <p>+91 98765 43210</p>
                  </div>
                </div>

                {/* Email */}

                <div className="info-item">
                  <i className="bi bi-envelope-fill"></i>

                  <div>
                    <h5>Email Us</h5>
                    <p>hospital@email.com</p>
                  </div>
                </div>

                {/* Working Hours */}

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

                <h2 className="mb-4">
                  Schedule Your Appointment
                </h2>

                <form onSubmit={handleSubmit}>

                  <div className="row">

                    {/* =================================================
                        NAME
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Email Address
                      </label>

                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    {/* =================================================
                        PHONE
                    ================================================= */}

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    {/* =================================================
                        AGE
                    ================================================= */}

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Age
                      </label>

                      <input
                        type="number"
                        className="form-control"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age"
                        min="1"
                        max="120"
                        required
                      />
                    </div>

                    {/* =================================================
                        GENDER
                    ================================================= */}

                    <div className="col-md-3 mb-3">
                      <label className="form-label">
                        Gender
                      </label>

                      <select
                        className="form-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
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
                        DOCTOR FROM DATABASE
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