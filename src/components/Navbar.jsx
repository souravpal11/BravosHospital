import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../logo.png";


const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeNavbar = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bravos-navbar sticky-top">
      <div className="container">

        {/* Logo */}
        <Link
          className="navbar-brand bravos-logo"
          to="/"
          onClick={closeNavbar}
        >
          <img
            src={Logo}
            alt="Bravos Hospital"
          />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler bravos-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div
          className={`bravos-nav-content ${
            isOpen ? "show" : ""
          }`}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
                to="/"
                onClick={closeNavbar}
              >
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/about" ? "active" : ""
                }`}
                to="/about"
                onClick={closeNavbar}
              >
                About Us
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/doctors" ? "active" : ""
                }`}
                to="/doctors"
                onClick={closeNavbar}
              >
                Our Doctors
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/services" ? "active" : ""
                }`}
                to="/services"
                onClick={closeNavbar}
              >
                Services
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/contact" ? "active" : ""
                }`}
                to="/contact"
                onClick={closeNavbar}
              >
                Contact
              </Link>
            </li>

            {/* Appointment Button */}
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <Link
                className="appointment-nav-btn"
                to="/login"
                onClick={closeNavbar}
              >
                <i className="bi bi-person me-2"></i>
                Login
              </Link>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;