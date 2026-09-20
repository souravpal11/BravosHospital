import React from "react";

const About = () => {
  return (
    <>
      {/* ================= HERO SECTION ================= */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content text-center">
            <span className="about-badge">ABOUT BRAVOS HOSPITAL</span>

            <h1>
              Caring for Your Health,
              <span> Every Step of the Way</span>
            </h1>

            <p>
              Bravos Hospital is committed to providing compassionate,
              reliable, and high-quality healthcare for you and your family.
            </p>
          </div>
        </div>

        <div className="hero-shape shape-one"></div>
        <div className="hero-shape shape-two"></div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="about-main-section">
        <div className="container">
          <div className="row align-items-center g-5">

            {/* Image */}
            <div className="col-lg-6">
              <div className="about-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d"
                  alt="Bravos Hospital"
                  className="img-fluid about-main-image"
                />

                <div className="experience-card">
                  <h2>10+</h2>
                  <p>Years of Excellence</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="col-lg-6">
              <div className="about-content">
                <span className="section-tag">WHO WE ARE</span>

                <h2>
                  Healthcare You Can
                  <span> Trust</span>
                </h2>

                <p>
                  At Bravos Hospital, we believe that quality healthcare
                  should be accessible, compassionate, and centered around
                  every patient's individual needs.
                </p>

                <p>
                  Our experienced doctors, dedicated nurses, and modern
                  healthcare facilities work together to provide the highest
                  standard of medical care.
                </p>

                <div className="about-features">

                  <div className="about-feature">
                    <div className="feature-icon">
                      <i className="bi bi-heart-pulse-fill"></i>
                    </div>

                    <div>
                      <h5>Patient-Centered Care</h5>
                      <p>
                        Every patient receives personalized attention and care.
                      </p>
                    </div>
                  </div>

                  <div className="about-feature">
                    <div className="feature-icon">
                      <i className="bi bi-shield-check"></i>
                    </div>

                    <div>
                      <h5>Trusted Medical Experts</h5>
                      <p>
                        Experienced professionals dedicated to your health.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= STATS SECTION ================= */}
      <section className="stats-section">
        <div className="container">
          <div className="row text-center">

            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="stat-item">
                <i className="bi bi-people-fill"></i>
                <h2>25K+</h2>
                <p>Happy Patients</p>
              </div>
            </div>

            <div className="col-md-3 col-6 mb-4 mb-md-0">
              <div className="stat-item">
                <i className="bi bi-person-badge-fill"></i>
                <h2>50+</h2>
                <p>Expert Doctors</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="stat-item">
                <i className="bi bi-hospital-fill"></i>
                <h2>15+</h2>
                <p>Departments</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="stat-item">
                <i className="bi bi-award-fill"></i>
                <h2>10+</h2>
                <p>Years Experience</p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= MISSION & VISION ================= */}
      <section className="mission-section">
        <div className="container">

          <div className="text-center section-heading">
            <span className="section-tag">OUR PURPOSE</span>

            <h2>
              Dedicated to Better
              <span> Healthcare</span>
            </h2>

            <p>
              Our mission and vision guide everything we do.
            </p>
          </div>

          <div className="row g-4 mt-3">

            {/* Mission */}
            <div className="col-lg-6">
              <div className="purpose-card">

                <div className="purpose-icon">
                  <i className="bi bi-bullseye"></i>
                </div>

                <h3>Our Mission</h3>

                <p>
                  To provide accessible, compassionate, and high-quality
                  healthcare through experienced professionals, modern
                  technology, and patient-centered services.
                </p>

              </div>
            </div>


            {/* Vision */}
            <div className="col-lg-6">
              <div className="purpose-card">

                <div className="purpose-icon">
                  <i className="bi bi-eye-fill"></i>
                </div>

                <h3>Our Vision</h3>

                <p>
                  To become a trusted healthcare destination known for
                  medical excellence, innovation, compassion, and a
                  commitment to improving lives.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-section">
        <div className="container">

          <div className="text-center section-heading">
            <span className="section-tag">WHY BRAVOS</span>

            <h2>
              Why Choose
              <span> Bravos Hospital?</span>
            </h2>

            <p>
              We combine medical expertise, advanced technology, and
              compassionate care to give you the best healthcare experience.
            </p>
          </div>

          <div className="row g-4 mt-3">

            <div className="col-lg-4 col-md-6">
              <div className="why-card">

                <div className="why-icon">
                  <i className="bi bi-heart-pulse"></i>
                </div>

                <h4>Compassionate Care</h4>

                <p>
                  We treat every patient with dignity, empathy, and respect.
                </p>

              </div>
            </div>


            <div className="col-lg-4 col-md-6">
              <div className="why-card">

                <div className="why-icon">
                  <i className="bi bi-cpu"></i>
                </div>

                <h4>Modern Technology</h4>

                <p>
                  Advanced facilities and technology for better diagnosis
                  and treatment.
                </p>

              </div>
            </div>


            <div className="col-lg-4 col-md-6">
              <div className="why-card">

                <div className="why-icon">
                  <i className="bi bi-person-check"></i>
                </div>

                <h4>Expert Specialists</h4>

                <p>
                  Skilled doctors and healthcare professionals you can trust.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= CTA SECTION ================= */}
      <section className="about-cta">
        <div className="container text-center">

          <h2>Your Health Deserves the Best Care</h2>

          <p>
            Take the first step toward better health. Book your appointment
            with our experienced medical professionals today.
          </p>

          <a href="/appointment" className="about-cta-btn">
            <i className="bi bi-calendar-check me-2"></i>
            Book an Appointment
          </a>

        </div>
      </section>
    </>
  );
};

export default About;