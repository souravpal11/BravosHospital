import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Gallery from "./Gallery";

const Home = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // ==========================================
  // FETCH TOP 4 EXPERT DOCTORS
  // ==========================================

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/doctors");

        // Handle both possible API responses:
        // response.data
        // OR response.data.doctors

        const doctorList = response.data.doctors || response.data;

        // Sort by experience:
        // Highest experience first
        const topDoctors = [...doctorList]
          .filter((doctor) => doctor.isActive !== false)
          .sort((a, b) => Number(b.experience || 0) - Number(a.experience || 0))
          .slice(0, 4);

        setDoctors(topDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <>
      {/* ================= HERO SECTION ================= */}

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">
              <i className="bi bi-heart-pulse-fill"></i>
              Trusted Healthcare
            </span>

            <h1>
              Your Health Is Our
              <span> Highest Priority</span>
            </h1>

            <p>
              Experience compassionate care, expert doctors, and modern
              healthcare services at Bravos Hospital.
            </p>

            <div className="hero-buttons">
              <Link className="hero-primary-btn" to="/signup">
                <i className="bi bi-person-plus me-2"></i>
                Get Started
              </Link>

              <Link className="hero-secondary-btn" to="/about">
                Learn More
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}

      <section className="home-features">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="bi bi-person-heart"></i>
                </div>

                <div>
                  <h4>Expert Doctors</h4>

                  <p>Highly qualified and experienced medical professionals.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="bi bi-hospital"></i>
                </div>

                <div>
                  <h4>Modern Facilities</h4>

                  <p>Advanced healthcare facilities for better treatment.</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="home-feature-card">
                <div className="home-feature-icon">
                  <i className="bi bi-clock-history"></i>
                </div>

                <div>
                  <h4>Quality Care</h4>

                  <p>Compassionate and reliable healthcare when you need it.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DOCTORS ================= */}

      <section className="doctor-section">
        <div className="container">
          <div className="section-heading text-center">
            <span className="section-tag">OUR MEDICAL TEAM</span>

            <h2>
              Meet Our <span>Experts</span>
            </h2>

            <p>
              Our most experienced doctors are dedicated to providing the best
              possible care for every patient.
            </p>
          </div>

          {/* ================= DOCTOR LOADING ================= */}

          {loadingDoctors ? (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                role="status"
                style={{
                  color: "var(--primary-teal)",
                }}
              >
                <span className="visually-hidden">Loading doctors...</span>
              </div>

              <p className="mt-3">Loading our experts...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-person-x"
                style={{
                  fontSize: "40px",
                  color: "var(--primary-teal)",
                }}
              ></i>

              <p className="mt-3">No doctors available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4 mt-3">
              {doctors.map((doctor) => (
                <div className="col-xl-3 col-lg-4 col-md-6" key={doctor._id}>
                  <div className="doctor-card">
                    {/* DOCTOR IMAGE */}

                    <div className="doctor-image">
                      <img
                        src={
                          doctor.image ||
                          "https://via.placeholder.com/400x400?text=Doctor"
                        }
                        alt={doctor.name}
                      />

                      <div className="doctor-icon">
                        <i className="bi bi-person-plus-fill"></i>
                      </div>
                    </div>

                    {/* DOCTOR DETAILS */}

                    <div className="doctor-card-body">
                      <span className="doctor-speciality">
                        {doctor.specialization || "Medical Specialist"}
                      </span>

                      <h4>{doctor.name}</h4>

                      <h6>{doctor.qualification}</h6>

                      <p>
                        {doctor.description ||
                          `Experienced ${doctor.specialization || "medical"} specialist dedicated to providing quality healthcare.`}
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

                      {/* APPOINTMENT */}

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

      {/* ================= GALLERY ================= */}

      <Gallery />

      {/* ================= CTA ================= */}

      <section className="home-cta">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2>Need Medical Assistance?</h2>

              <p>
                Schedule an appointment with our experienced doctors and take
                the first step towards better health.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <Link to="/appointment" className="cta-appointment-btn">
                <i className="bi bi-calendar-check me-2"></i>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
