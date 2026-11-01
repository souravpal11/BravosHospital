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
import AppointmentQueue from "./components/AppointmentQueue";
import AdminBlockedSlots from "./components/AdminBlockedSlots";
import ManageDoctors from "./components/ManageDoctors";
import AdminReports from "./components/AdminReports";
import MyProfile from "./components/MyProfile";
import { MedicalRecords, Prescriptions } from "./components/ClinicalPages";
import {
  AdminPatients,
  AdminAppointments,
  DoctorPatients,
  DoctorAppointments,
} from "./components/HospitalDirectories";
import NotFound from "./components/NotFound";

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

        <Route path="/appointment" element={<Appointment />} />

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

        <Route path="/admin/blocked-slots" element={<AdminBlockedSlots />} />
        <Route path="/admin/doctors" element={<ManageDoctors />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/records" element={<MedicalRecords />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/profile" element={<MyProfile />} />

        {/* Doctor portal pages */}
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/records" element={<MedicalRecords />} />
        <Route path="/doctor/prescriptions" element={<Prescriptions />} />
        <Route path="/doctor/profile" element={<MyProfile />} />

        {/* Patient portal pages */}
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/profile" element={<MyProfile />} />

        <Route path="/appointment-queue" element={<AppointmentQueue />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
