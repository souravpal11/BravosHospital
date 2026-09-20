import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/doctors");

        setDoctors(response.data.doctors || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);

        setError("Unable to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doctors-page">
      {/* ================= HERO ================= */}

      <section className="doctors-hero">
        <div className="container">
          <span className="doctors-hero-tag">
            <i className="bi bi-heart-pulse-fill"></i>
            BRAVOS HOSPITAL
          </span>

          <h1>
            Meet Our <span>Doctors</span>
          </h1>

          <p>
            Our experienced and dedicated medical professionals are committed to
            providing you with trusted, compassionate and quality healthcare.
          </p>
        </div>
      </section>

      {/* ================= DOCTORS ================= */}

      <section className="doctors-section">
        <div className="container">
          <div className="doctors-section-header">
            <span>OUR MEDICAL EXPERTS</span>

            <h2>Find the Right Doctor for You</h2>

            <p>
              Explore our team of qualified healthcare professionals and choose
              a specialist for your healthcare needs.
            </p>
          </div>

          {/* LOADING */}

          {loading && (
            <div className="doctors-loading">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>

              <p>Loading our doctors...</p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="doctors-error">
              <i className="bi bi-exclamation-circle"></i>

              <p>{error}</p>
            </div>
          )}

          {/* NO DOCTORS */}

          {!loading && !error && doctors.length === 0 && (
            <div className="doctors-empty">
              <i className="bi bi-person-x"></i>

              <h4>No Doctors Available</h4>

              <p>
                Our doctor list is currently being updated. Please check again
                later.
              </p>
            </div>
          )}

          {/* DOCTOR CARDS */}

          {/* ================= DOCTOR CARDS ================= */}

          {!loading && !error && doctors.length > 0 && (
            <div className="row g-4">
              {doctors.map((doctor) => (
                <div
                  className="col-xl-4 col-lg-4 col-md-6"
                  key={doctor._id || doctor.id}
                >
                  <div className="doctor-card">
                    {/* IMAGE */}

                    <div className="doctor-image">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} />
                      ) : (
                        <div className="doctor-placeholder">
                          <i className="bi bi-person-fill"></i>
                        </div>
                      )}
                    </div>

                    {/* CARD BODY */}

                    <div className="doctor-card-body">
                      {/* SPECIALIZATION */}

                      <span className="doctor-speciality">
                        {doctor.specialization || "Medical Specialist"}
                      </span>

                      {/* NAME */}

                      <h4>{doctor.name}</h4>

                      {/* QUALIFICATION */}

                      <h6>
                        {doctor.qualification ||
                          "Qualified Medical Professional"}
                      </h6>

                      {/* DESCRIPTION */}

                      <p>
                        {doctor.description ||
                          `Experienced ${
                            doctor.specialization || "medical"
                          } specialist dedicated to providing quality healthcare.`}
                      </p>

                      {/* EXPERIENCE */}

                      <div className="doctor-experience">
                        <i className="bi bi-award-fill"></i>

                        <span>
                          {doctor.experience || 0}{" "}
                          {Number(doctor.experience) === 1 ? "Year" : "Years"}{" "}
                          Experience
                        </span>
                      </div>

                      {/* FEES */}

                      {doctor.fees !== undefined && (
                        <div className="doctor-fees">
                          <i className="bi bi-currency-rupee"></i>

                          <span>Consultation Fee: ₹{doctor.fees}</span>
                        </div>
                      )}

                      {/* BUTTON */}

                      <Link
                        to={`/appointment?doctor=${doctor._id}&department=${encodeURIComponent(
                          doctor.specialization || "",
                        )}`}
                        className="doctor-btn"
                      >
                        Book Appointment
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Doctors;
