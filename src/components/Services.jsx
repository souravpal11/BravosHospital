import React from "react";
import { Link } from "react-router-dom";

const Services = () => {
  const services = [
    {
      icon: "bi-heart-pulse-fill",
      title: "Cardiology",
      description:
        "Comprehensive heart care including diagnosis, treatment and preventive cardiac services.",
    },
    {
      icon: "bi-person-hearts",
      title: "General Medicine",
      description:
        "Complete medical consultation, diagnosis and treatment for a wide range of health conditions.",
    },
    {
      icon: "bi-bandaid-fill",
      title: "General Surgery",
      description:
        "Advanced surgical care performed by experienced and qualified surgical specialists.",
    },
    {
      icon: "bi-activity",
      title: "Emergency Care",
      description:
        "24/7 emergency medical services for urgent and critical healthcare needs.",
    },
    {
      icon: "bi-person-wheelchair",
      title: "Orthopedics",
      description:
        "Specialized treatment for bones, joints, muscles, fractures and movement-related conditions.",
    },
    {
      icon: "bi-lungs-fill",
      title: "Pulmonology",
      description:
        "Diagnosis and treatment of respiratory and lung-related health conditions.",
    },
    {
      icon: "bi-capsule",
      title: "Pharmacy",
      description:
        "Convenient access to prescribed medicines and healthcare products.",
    },
    {
      icon: "bi-file-earmark-medical-fill",
      title: "Diagnostic Services",
      description:
        "Reliable diagnostic and laboratory services to support accurate medical diagnosis.",
    },
    {
      icon: "bi-person-check-fill",
      title: "Preventive Healthcare",
      description:
        "Health checkups and preventive care designed to help you maintain a healthier life.",
    },
  ];

  return (
    <div className="services-page">

      {/* ================= HERO ================= */}

      <section className="services-hero">

        <div className="container">

          <span className="services-hero-tag">
            <i className="bi bi-heart-pulse-fill"></i>
            BRAVOS HOSPITAL
          </span>

          <h1>
            Our <span>Services</span>
          </h1>

          <p>
            Comprehensive healthcare services delivered by
            experienced professionals with compassion,
            expertise and advanced medical facilities.
          </p>

        </div>

      </section>


      {/* ================= SERVICES ================= */}

      <section className="services-section">

        <div className="container">

          <div className="services-heading">

            <span>WHAT WE OFFER</span>

            <h2>
              Healthcare Designed Around You
            </h2>

            <p>
              From routine consultations to specialized medical
              care, Bravos Hospital provides a wide range of
              healthcare services under one roof.
            </p>

          </div>


          <div className="row g-4">

            {services.map((service, index) => (

              <div
                className="col-xl-4 col-lg-4 col-md-6"
                key={index}
              >

                <div className="service-card">

                  <div className="service-icon">
                    <i className={`bi ${service.icon}`}></i>
                  </div>

                  <div className="service-content">

                    <h3>
                      {service.title}
                    </h3>

                    <p>
                      {service.description}
                    </p>

                    <Link
                      to="/appointment"
                      className="service-link"
                    >
                      Book Appointment
                      <i className="bi bi-arrow-right"></i>
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* ================= WHY BRAVOS ================= */}

      <section className="services-why">

        <div className="container">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <span className="services-small-title">
                WHY BRAVOS HOSPITAL
              </span>

              <h2>
                Quality Healthcare With
                <span> Compassion</span>
              </h2>

              <p>
                We believe healthcare is more than diagnosis
                and treatment. Our team focuses on providing
                every patient with personalized, respectful
                and reliable care.
              </p>


              <div className="why-list">

                <div className="why-item">

                  <div className="why-icon">
                    <i className="bi bi-person-check-fill"></i>
                  </div>

                  <div>
                    <h5>Experienced Doctors</h5>
                    <p>
                      Qualified professionals dedicated to
                      patient care.
                    </p>
                  </div>

                </div>


                <div className="why-item">

                  <div className="why-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>

                  <div>
                    <h5>Safe & Trusted</h5>
                    <p>
                      Your health and personal information
                      are treated with care.
                    </p>
                  </div>

                </div>


                <div className="why-item">

                  <div className="why-icon">
                    <i className="bi bi-clock-fill"></i>
                  </div>

                  <div>
                    <h5>24/7 Emergency Care</h5>
                    <p>
                      Medical assistance whenever you need it.
                    </p>
                  </div>

                </div>

              </div>

            </div>


            <div className="col-lg-6">

              <div className="services-care-card">

                <div className="care-icon">
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>

                <span>
                  PATIENT-CENTERED CARE
                </span>

                <h3>
                  Your Health Is Our Priority
                </h3>

                <p>
                  Our healthcare professionals work together
                  to deliver safe, effective and compassionate
                  medical care for every patient.
                </p>

                <Link
                  to="/doctors"
                  className="care-btn"
                >
                  Meet Our Doctors
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="services-cta">

        <div className="container">

          <div className="services-cta-content">

            <div>

              <span>
                NEED MEDICAL ASSISTANCE?
              </span>

              <h2>
                Take the First Step Towards Better Health
              </h2>

              <p>
                Book an appointment with one of our
                experienced healthcare professionals today.
              </p>

            </div>

            <Link
              to="/appointment"
              className="services-cta-btn"
            >
              <i className="bi bi-calendar-check me-2"></i>
              Book Appointment
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Services;