import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import "./AdminBlockedSlots.css";

const AdminBlockedSlots = () => {
  const token = sessionStorage.getItem("token");
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    doctor: "",
    date: "",
    startTime: "",
    endTime: "",
    reason: "Doctor unavailable",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [doctorResponse, slotResponse] = await Promise.all([
        api.get("/api/doctors"),
        api.get("/api/appointments/blocked-slots", { headers }),
      ]);
      const doctorList = doctorResponse.data?.doctors || [];
      setDoctors(doctorList);
      setSlots(slotResponse.data?.blockedSlots || []);
      setForm((current) => ({
        ...current,
        doctor: current.doctor || doctorList[0]?._id || "",
      }));
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to load doctors or blocked slots. Please login again as admin.",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotice({ type: "", text: "" });
    if (
      !form.doctor ||
      !form.date ||
      !form.startTime ||
      !form.endTime ||
      !form.reason.trim()
    ) {
      setNotice({ type: "error", text: "Please complete all fields." });
      return;
    }
    if (form.endTime <= form.startTime) {
      setNotice({
        type: "error",
        text: "End time must be later than start time.",
      });
      return;
    }
    setSaving(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await api.post("/api/appointments/block-slot", form, {
        headers,
      });
      setNotice({
        type: "success",
        text: response.data?.message || "Time blocked successfully.",
      });
      setForm((current) => ({
        ...current,
        startTime: "",
        endTime: "",
        reason: "Doctor unavailable",
      }));
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "Unable to block this time.",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeSlot = async (id) => {
    if (
      !window.confirm(
        "Remove this blocked period? Patients will be able to book appointments in this time again.",
      )
    )
      return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const response = await api.delete(
        `/api/appointments/blocked-slots/${id}`,
        { headers },
      );
      setNotice({
        type: "success",
        text: response.data?.message || "Blocked time removed.",
      });
      await loadData();
    } catch (error) {
      setNotice({
        type: "error",
        text: error.response?.data?.message || "Unable to remove blocked time.",
      });
    }
  };

  const displayTime = (value) => {
    if (!value) return "—";
    const [hours, minutes] = value.split(":").map(Number);
    const suffix = hours >= 12 ? "PM" : "AM";
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  return (
    <div className="admin-blocked-page">
      <main className="admin-blocked-main">
        <div className="admin-blocked-heading">
          <div>
            <p>APPOINTMENT MANAGEMENT</p>
            <h1>Block Doctor Time</h1>
            <span>Make a doctor unavailable for a selected period.</span>
          </div>
          <div className="d-flex gap-2">
          <Link to="/admin-dashboard" className="back-dashboard-btn">
              <i className="bi bi-arrow-left"></i>
            </Link>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={loadData}
          >
            ↻ Refresh
          </button>
          </div>
        </div>
        {notice.text && (
          <div className={`blocked-notice ${notice.type}`}>{notice.text}</div>
        )}
        <section className="blocked-form-card">
          <h2>Block a time range</h2>
          <p>
            Any existing approved or waiting appointments starting within this
            period will be cancelled automatically.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="blocked-form-grid">
              <label>
                Doctor
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} — {doctor.specialization}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Start time
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                End time
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="blocked-reason">
                Reason
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="e.g. Doctor on leave"
                  required
                />
              </label>
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={saving || loading}
            >
              {saving
                ? "Blocking time…"
                : "Block Time & Cancel Existing Bookings"}
            </button>
          </form>
        </section>
        <section className="blocked-list-card">
          <div className="blocked-list-heading">
            <div>
              <h2>Currently blocked periods</h2>
              <p>Patients cannot book appointments during these periods.</p>
            </div>
            <span>{slots.length} blocked</span>
          </div>
          {loading ? (
            <p>Loading blocked periods…</p>
          ) : slots.length === 0 ? (
            <div className="blocked-empty">No blocked periods yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Blocked time</th>
                    <th>Reason</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot._id}>
                      <td>
                        <strong>{slot.doctor?.name || "Doctor"}</strong>
                        <small>{slot.doctor?.specialization || ""}</small>
                      </td>
                      <td>{slot.date}</td>
                      <td>
                        {slot.startTime && slot.endTime
                          ? `${displayTime(slot.startTime)} – ${displayTime(slot.endTime)}`
                          : slot.time || "Full day"}
                      </td>
                      <td>{slot.reason}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeSlot(slot._id)}
                        >
                          Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminBlockedSlots;
