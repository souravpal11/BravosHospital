import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bravos-footer">
      <div className="container">

        <div className="row g-4 footer-main">

          {/* Hospital Info */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <h2>
                BRAVOS <span>Hospital</span>
              </h2>

              <p>
                Providing compassionate, reliable, and quality healthcare
                for you and your family.
              </p>

              <div className="footer-social">

                <a
                  href="https://github.com/souravpal11"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <i className="bi bi-github"></i>
                </a>

                <a
                  href="https://www.linkedin.com/in/sourav-pal-4195aa380/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="bi bi-linkedin"></i>
                </a>

                <a
                  href="mailto:souravsir2008@gmail.com"
                  aria-label="Email"
                >
                  <i className="bi bi-envelope-fill"></i>
                </a>

              </div>
            </div>
          </div>


          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <div className="footer-links">
              <h5>Quick Links</h5>

              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>

                <li>
                  <Link to="/about">About Us</Link>
                </li>

                <li>
                  <Link to="/appointment">
                    Book Appointment
                  </Link>
                </li>

                <li>
                  <Link to="/login">Login</Link>
                </li>
              </ul>
            </div>
          </div>


          {/* Patient */}
          <div className="col-lg-3 col-md-6">
            <div className="footer-links">
              <h5>For Patients</h5>

              <ul>
                <li>
                  <Link to="/signup">
                    Patient Registration
                  </Link>
                </li>

                <li>
                  <Link to="/appointment">
                    Book Appointment
                  </Link>
                </li>

                <li>
                  <Link to="/login">
                    Patient Login
                  </Link>
                </li>

                <li>
                  <a href="#support">
                    Patient Support
                  </a>
                </li>
              </ul>
            </div>
          </div>


          {/* Doctors */}
          <div className="col-lg-3 col-md-6">
            <div className="footer-links">
              <h5>For Doctors</h5>

              <ul>
                <li>
                  <Link to="/login">
                    Doctor Login
                  </Link>
                </li>

                <li>
                  <a href="#schedule">
                    Manage Appointments
                  </a>
                </li>

                <li>
                  <a href="#dashboard">
                    Doctor Dashboard
                  </a>
                </li>

                <li>
                  <a href="#support">
                    Doctor Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>


        {/* Footer Bottom */}

        <div className="footer-bottom">

          <p>
            © 2026 <strong>BRAVOS Hospital</strong> |
            Made with <i className="bi bi-heart-fill"></i> by Team BRAVOS
          </p>

          <div className="footer-bottom-links">
            <a href="#privacy">
              Privacy Policy
            </a>

            <a href="#terms">
              Terms & Conditions
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;