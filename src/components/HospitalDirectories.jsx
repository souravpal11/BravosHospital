import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import "./HospitalDirectory.css";

const getToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");
const auth = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

function DirectoryLayout({ title, subtitle, back, children }) {
  return <main className="bravos-directory">
    <header className="bravos-directory-header">
      <div><Link to={back} className="bravos-back"><i className="bi bi-arrow-left" /> Dashboard</Link>
        <span className="bravos-eyebrow">BRAVOS HOSPITAL MANAGEMENT</span>
        <h1>{title}</h1><p>{subtitle}</p>
      </div>
    </header>{children}
  </main>;
}

function useDirectory(endpoint, key) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.get(endpoint, auth()).then(({ data }) => {
      if (active) setItems(Array.isArray(data[key]) ? data[key] : []);
    }).catch((e) => {
      if (active) setError(e.response?.data?.message || `Unable to load ${key}. Please sign in again.`);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint, key, reload]);
  return { items, setItems, loading, error, refresh: () => setReload(v => v + 1) };
}

function SearchBar({ value, onChange, placeholder }) {
  return <div className="bravos-search"><i className="bi bi-search" /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>;
}

export function DoctorPatients() {
  const { items: appointments, loading, error } = useDirectory("/api/appointments", "appointments");
  const [search, setSearch] = useState("");
  const patients = useMemo(() => {
    const map = new Map();
    appointments.forEach(a => {
      const p = a.patient && typeof a.patient === "object" ? a.patient : null;
      const id = p?._id || a.patient || a.email;
      if (!id) return;
      const old = map.get(String(id));
      const item = { id: String(id), name: p?.name || a.name || "Patient", email: p?.email || a.email || "", phone: p?.phone || a.phone || "", age: p?.age ?? a.age, gender: p?.gender || a.gender || "", lastVisit: a.date, department: a.department || "", totalVisits: (old?.totalVisits || 0) + 1 };
      if (!old || String(a.date) > String(old.lastVisit)) item.lastVisit = a.date;
      map.set(String(id), { ...old, ...item, totalVisits: (old?.totalVisits || 0) + 1 });
    });
    return [...map.values()];
  }, [appointments]);
  const filtered = patients.filter(p => `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <DirectoryLayout title="My Patients" subtitle="Patients who have booked appointments with you." back="/doctor-dashboard">
    <section className="bravos-panel"><div className="bravos-toolbar"><div><strong>{patients.length}</strong><span> Unique patients</span></div><SearchBar value={search} onChange={setSearch} placeholder="Search patients..." /></div>
      {loading ? <p className="bravos-state">Loading patients…</p> : error ? <p className="bravos-error">{error}</p> : filtered.length === 0 ? <p className="bravos-state">No patients found. Patients appear here after booking an appointment with you.</p> :
      <div className="bravos-table-wrap"><table><thead><tr><th>Patient</th><th>Contact</th><th>Age / Gender</th><th>Department</th><th>Last appointment</th><th>Visits</th></tr></thead><tbody>
        {filtered.map(p => <tr key={p.id}><td><strong>{p.name}</strong><small>{p.email}</small></td><td>{p.phone || "—"}</td><td>{p.age ?? "—"} / {p.gender || "—"}</td><td>{p.department || "—"}</td><td>{formatDate(p.lastVisit)}</td><td><span className="bravos-count">{p.totalVisits}</span></td></tr>)}
      </tbody></table></div>}
    </section>
  </DirectoryLayout>;
}

function AppointmentsPage({ admin }) {
  const { items, setItems, loading, error, refresh } = useDirectory("/api/appointments", "appointments");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [saving, setSaving] = useState("");
  const filtered = items.filter(a => {
    const doctor = a.doctor && typeof a.doctor === "object" ? a.doctor.name : "";
    const matches = `${a.name || ""} ${a.email || ""} ${doctor} ${a.department || ""}`.toLowerCase().includes(search.toLowerCase());
    return matches && (status === "all" || a.status === status);
  });
  const updateStatus = async (id, next) => {
    setSaving(id);
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: next }, auth());
      setItems(old => old.map(a => a._id === id ? { ...a, status: next } : a));
    } catch (e) { window.alert(e.response?.data?.message || "Could not update appointment."); }
    finally { setSaving(""); }
  };
  return <DirectoryLayout title={admin ? "All Appointments" : "My Appointments"} subtitle={admin ? "View and manage appointments across the hospital." : "Appointments assigned to your doctor account."} back={admin ? "/admin-dashboard" : "/doctor-dashboard"}>
    <section className="bravos-panel"><div className="bravos-toolbar"><div><strong>{filtered.length}</strong><span> Appointments</span></div><div className="bravos-filters"><SearchBar value={search} onChange={setSearch} placeholder="Search patient, doctor..." /><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option><option value="approved">Approved</option><option value="waiting">Waiting</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select><button onClick={refresh} className="bravos-refresh" title="Refresh"><i className="bi bi-arrow-clockwise" /></button></div></div>
      {loading ? <p className="bravos-state">Loading appointments…</p> : error ? <p className="bravos-error">{error}</p> : filtered.length === 0 ? <p className="bravos-state">No appointments match your search.</p> :
      <div className="bravos-table-wrap"><table><thead><tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date &amp; Time</th><th>Booking</th><th>Attendance</th>{admin && <th>Manage</th>}</tr></thead><tbody>
        {filtered.map(a => <tr key={a._id}><td><strong>{a.name || a.patient?.name || "Patient"}</strong><small>{a.email || a.patient?.email || ""}</small><small>{a.phone || a.patient?.phone || ""}</small></td><td>{a.doctor?.name || "—"}</td><td>{a.department || "—"}</td><td>{formatDate(a.date)}<small>{a.time || "—"}</small></td><td><span className={`bravos-status ${a.status}`}>{a.status || "—"}</span></td><td>{(a.attendanceStatus || "not_arrived").replaceAll("_", " ")}</td>{admin && <td><select aria-label="Update appointment status" disabled={saving === a._id} value={a.status} onChange={e => updateStatus(a._id, e.target.value)}><option value="approved">Approved</option><option value="waiting">Waiting</option><option value="cancelled">Cancelled</option></select></td>}</tr>)}
      </tbody></table></div>}
    </section>
  </DirectoryLayout>;
}
export function DoctorAppointments() { return <AppointmentsPage admin={false} />; }
export function AdminAppointments() { return <AppointmentsPage admin />; }

export function AdminPatients() {
  const { items, loading, error } = useDirectory("/api/patient-directory", "patients");
  const [search, setSearch] = useState("");
  const filtered = items.filter(p => `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <DirectoryLayout title="All Patients" subtitle="Registered patient directory for BRAVOS Hospital." back="/admin-dashboard">
    <section className="bravos-panel"><div className="bravos-toolbar"><div><strong>{filtered.length}</strong><span> Registered patients</span></div><SearchBar value={search} onChange={setSearch} placeholder="Search patients..." /></div>
      {loading ? <p className="bravos-state">Loading patients…</p> : error ? <p className="bravos-error">{error}</p> : filtered.length === 0 ? <p className="bravos-state">No registered patients found.</p> :
      <div className="bravos-table-wrap"><table><thead><tr><th>Patient</th><th>Phone</th><th>Age</th><th>Gender</th><th>Registered</th></tr></thead><tbody>
        {filtered.map(p => <tr key={p._id}><td><strong>{p.name}</strong><small>{p.email}</small></td><td>{p.phone || "—"}</td><td>{p.age ?? "—"}</td><td>{p.gender || "—"}</td><td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "—"}</td></tr>)}
      </tbody></table></div>}
    </section>
  </DirectoryLayout>;
}
