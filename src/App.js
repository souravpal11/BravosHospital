import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";

import Appointment from "./components/Appointments";
import About from "./components/About";

import Login from "./components/Login";
import PatientSignup from "./components/PatientSignup";

import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminGallery from "./components/AdminGallery";
import AdminRegisterDoctor from "./components/AdminRegisterDoctor";
import Doctors from "./components/Doctors";
import Services from "./components/Services";
import Contact from "./components/Contact";
import ForgotPassword from "./components/ForgotPassword";
import MyAppointments from "./components/MyAppointments";

// ================================
// PUBLIC LAYOUT
// ================================

const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />

      {children}

      <Footer />
    </>
  );
};

// ================================
// APP
// ================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC PAGES
        ========================== */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/doctors"
          element={
            <PublicLayout>
              <Doctors />
            </PublicLayout>
          }
        />

        <Route
          path="/services"
          element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        <Route
          path="/appointment"
          element={
            <PublicLayout>
              <Appointment />
            </PublicLayout>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicLayout>
              <PatientSignup />
            </PublicLayout>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* =========================
            PATIENT
        ========================== */}

        <Route path="/patient-dashboard" element={<PatientDashboard />} />

        <Route path="/my-appointments" element={<MyAppointments />} />

        {/* =========================
            DOCTOR
        ========================== */}

        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

        {/* =========================
            ADMIN
        ========================== */}

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route
          path="/admin/register-doctor"
          element={<AdminRegisterDoctor />}
        />

        <Route path="/admin/gallery" element={<AdminGallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
