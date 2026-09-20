import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/contact",
        formData,
      );

      alert(response.data.message);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Unable to send message. Please try again.",
      );
    }
  };

  return (
    <div className="contact-page">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="contact-hero">
        <div className="container">
          <span className="contact-hero-tag">
            <i className="bi bi-chat-dots-fill"></i>
            BRAVOS HOSPITAL
          </span>

          <h1>
            Get in <span>Touch</span>
          </h1>

          <p>
            Have a question or need assistance? Our team is here to help you
            with your healthcare needs.
          </p>
        </div>
      </section>

      {/* =================================================
          CONTACT SECTION
      ================================================= */}

      <section className="contact-section">
        <div className="container">
          <div className="row g-4">
            {/* ============================================
                LEFT INFORMATION
            ============================================ */}

            <div className="col-lg-5">
              <div className="contact-info-card">
                <span className="contact-small-title">CONTACT INFORMATION</span>

                <h2>We're Here to Help</h2>

                <p>
                  Reach out to us for appointments, healthcare information, or
                  any assistance you may need.
                </p>

                {/* ADDRESS */}

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>

                  <div>
                    <span>Hospital Address</span>

                    <p>
                      Bravos Hospital,
                      <br />
                      Main Road, Gwalior,
                      <br />
                      Madhya Pradesh, India
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="bi bi-telephone-fill"></i>
                  </div>

                  <div>
                    <span>Phone</span>

                    <p>+91 98765 43210</p>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </div>

                  <div>
                    <span>Email</span>

                    <p>info@bravoshospital.com</p>
                  </div>
                </div>

                {/* EMERGENCY */}

                <div className="contact-emergency">
                  <div className="contact-emergency-icon">
                    <i className="bi bi-telephone-plus-fill"></i>
                  </div>

                  <div>
                    <span>24/7 EMERGENCY HELPLINE</span>

                    <strong>+91 98765 43210</strong>
                  </div>
                </div>

                {/* SOCIAL */}

                <div className="contact-social">
                  <span>Follow Us</span>

                  <div>
                    <a href="#facebook">
                      <i className="bi bi-facebook"></i>
                    </a>

                    <a href="#instagram">
                      <i className="bi bi-instagram"></i>
                    </a>

                    <a href="#twitter">
                      <i className="bi bi-twitter-x"></i>
                    </a>

                    <a href="#linkedin">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================
                RIGHT CONTACT FORM
            ============================================ */}

            <div className="col-lg-7">
              <div className="contact-form-card">
                <div className="contact-form-header">
                  <span>SEND US A MESSAGE</span>

                  <h2>How Can We Help You?</h2>

                  <p>
                    Fill out the form below and our team will get back to you as
                    soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {/* NAME */}

                    <div className="col-md-6">
                      <label className="contact-form-label">Full Name</label>

                      <div className="contact-input">
                        <i className="bi bi-person"></i>

                        <input
                          type="text"
                          name="name"
                          placeholder="Enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6">
                      <label className="contact-form-label">
                        Email Address
                      </label>

                      <div className="contact-input">
                        <i className="bi bi-envelope"></i>

                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* PHONE */}

                    <div className="col-md-6">
                      <label className="contact-form-label">Phone Number</label>

                      <div className="contact-input">
                        <i className="bi bi-telephone"></i>

                        <input
                          type="tel"
                          name="phone"
                          placeholder="Enter your phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* SUBJECT */}

                    <div className="col-md-6">
                      <label className="contact-form-label">Subject</label>

                      <div className="contact-input">
                        <i className="bi bi-chat-left-text"></i>

                        <input
                          type="text"
                          name="subject"
                          placeholder="Message subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* MESSAGE */}

                    <div className="col-12">
                      <label className="contact-form-label">Your Message</label>

                      <div className="contact-textarea">
                        <i className="bi bi-pencil-square"></i>

                        <textarea
                          name="message"
                          rows="6"
                          placeholder="Write your message here..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                    </div>

                    {/* BUTTON */}

                    <div className="col-12">
                      <button type="submit" className="contact-submit-btn">
                        Send Message
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          OPENING HOURS
      ================================================= */}

      <section className="contact-hours">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <span className="contact-small-title">WHEN YOU CAN REACH US</span>

              <h2>Hospital Hours</h2>

              <p>
                Our hospital provides round-the-clock emergency services.
                Regular departments operate according to the schedule below.
              </p>
            </div>

            <div className="col-lg-7">
              <div className="hours-card">
                <div className="hours-item">
                  <div>
                    <i className="bi bi-calendar-week"></i>
                    <span>Monday - Friday</span>
                  </div>

                  <strong>8:00 AM - 8:00 PM</strong>
                </div>

                <div className="hours-item">
                  <div>
                    <i className="bi bi-calendar-week"></i>
                    <span>Saturday</span>
                  </div>

                  <strong>8:00 AM - 6:00 PM</strong>
                </div>

                <div className="hours-item">
                  <div>
                    <i className="bi bi-calendar-event"></i>
                    <span>Sunday</span>
                  </div>

                  <strong>9:00 AM - 2:00 PM</strong>
                </div>

                <div className="hours-item emergency-hours">
                  <div>
                    <i className="bi bi-heart-pulse-fill"></i>
                    <span>Emergency Services</span>
                  </div>

                  <strong>24 / 7</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAP
      ================================================= */}

      <section className="contact-map">
        <div className="container">
          <div className="contact-map-wrapper">
            <iframe
              title="Bravos Hospital Location"
              src="https://www.google.com/maps?q=Gwalior,Madhya+Pradesh,India&output=embed"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
