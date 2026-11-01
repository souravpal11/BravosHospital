import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import "./ManageDoctors.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  fees: "",
  gender: "",
  isActive: true,
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = sessionStorage.getItem("token");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token],
  );

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/doctors/admin/all", { headers });
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load doctor profiles. Please sign in as admin.",
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const visibleDoctors = doctors.filter((doctor) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      [doctor.name, doctor.email, doctor.specialization, doctor.phone].some(
        (value) =>
          String(value || "")
            .toLowerCase()
            .includes(term),
      );
    const matchesStatus =
      status === "all" ||
      (status === "active" ? doctor.isActive : !doctor.isActive);
    return matchesSearch && matchesStatus;
  });

  const startEdit = (doctor) => {
    setEditing(doctor);
    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience ?? "",
      fees: doctor.fees ?? "",
      gender: doctor.gender || "",
      isActive: Boolean(doctor.isActive),
    });
    setError("");
    setNotice("");
  };

  const saveDoctor = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        experience: Number(form.experience),
        fees: Number(form.fees),
      };
      const { data } = await api.patch(
        `/api/doctors/admin/${editing._id}`,
        payload,
        { headers },
      );
      setDoctors((current) =>
        current.map((doctor) =>
          doctor._id === editing._id ? data.doctor : doctor,
        ),
      );
      setEditing(null);
      setNotice("Doctor profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save doctor profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (doctor) => {
    setError("");
    setNotice("");
    try {
      const { data } = await api.patch(
        `/api/doctors/admin/${doctor._id}`,
        { isActive: !doctor.isActive },
        { headers },
      );
      setDoctors((current) =>
        current.map((item) => (item._id === doctor._id ? data.doctor : item)),
      );
      setNotice(
        `${doctor.name} is now ${data.doctor.isActive ? "active" : "inactive"}.`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update doctor status.",
      );
    }
  };

  return (
    <div className="manage-doctors-page">
      <main className="manage-doctors-main">
        <header className="md-header">
          <div>
            <span>BRAVOS / ADMINISTRATION</span>
            <h1>Manage Doctors</h1>
            <p>Update doctor profiles and control directory access.</p>
          </div>
          <div className="d-flex gap-2 ">
            <Link to="/admin-dashboard" className="back-dashboard-btn">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <Link className="md-add-btn" to="/admin/register-doctor">
              <i className="bi bi-plus-lg" /> Register Doctor
            </Link>
          </div>
        </header>

        <section className="md-summary">
          <article>
            <span>Total doctors</span>
            <strong>{doctors.length}</strong>
          </article>
          <article>
            <span>Active doctors</span>
            <strong>{doctors.filter((d) => d.isActive).length}</strong>
          </article>
          <article>
            <span>Inactive doctors</span>
            <strong>{doctors.filter((d) => !d.isActive).length}</strong>
          </article>
        </section>

        {error && <div className="md-alert error">{error}</div>}
        {notice && <div className="md-alert success">{notice}</div>}

        <section className="md-list-card">
          <div className="md-tools">
            <div>
              <h2>Doctor directory</h2>
              <p>Search, edit or deactivate registered doctors.</p>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or specialty…"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All doctors</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <button onClick={loadDoctors} disabled={loading}>
              <i className="bi bi-arrow-clockwise" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="md-empty">Loading doctor profiles…</div>
          ) : visibleDoctors.length === 0 ? (
            <div className="md-empty">No doctors match your search.</div>
          ) : (
            <div className="table-responsive">
              <table className="table md-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Consultation fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDoctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>
                        <div className="md-doctor">
                          <div className="md-avatar">
                            {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                          </div>
                          <div>
                            <b>{doctor.name}</b>
                            <small>{doctor.email}</small>
                            <small>{doctor.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {doctor.specialization || "—"}
                        <small className="md-subline">
                          {doctor.qualification || ""}
                        </small>
                      </td>
                      <td>{doctor.experience ?? 0} years</td>
                      <td>
                        ₹{Number(doctor.fees || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          className={`md-status ${doctor.isActive ? "on" : "off"}`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="md-row-actions">
                          <button onClick={() => startEdit(doctor)}>
                            <i className="bi bi-pencil-square" /> Edit
                          </button>
                          <button
                            className={
                              doctor.isActive ? "deactivate" : "activate"
                            }
                            onClick={() => toggleStatus(doctor)}
                          >
                            {doctor.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {editing && (
        <div
          className="md-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) setEditing(null);
          }}
        >
          <section
            className="md-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="md-edit-title"
          >
            <div className="md-modal-head">
              <div>
                <span>DOCTOR PROFILE</span>
                <h2 id="md-edit-title">Edit doctor details</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                aria-label="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <form onSubmit={saveDoctor}>
              <div className="md-form-grid">
                <label>
                  Full name
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Gender
                  <select
                    required
                    value={form.gender}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, gender: e.target.value }))
                    }
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Specialization
                  <input
                    required
                    value={form.specialization}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, specialization: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Qualification
                  <input
                    required
                    value={form.qualification}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, qualification: e.target.value }))
                    }
                  />
                </label>
                <label className="admin-controlled">
                  Experience (years) <span>Admin controlled</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={form.experience}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, experience: e.target.value }))
                    }
                  />
                </label>
                <label className="admin-controlled">
                  Consultation fee (₹) <span>Admin controlled</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.fees}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fees: e.target.value }))
                    }
                  />
                </label>
                <label className="md-active-toggle">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                  />{" "}
                  Doctor account active
                </label>
              </div>
              <div className="md-permission-note">
                <i className="bi bi-shield-lock-fill" /> Only hospital
                administrators can change a doctor's experience and consultation
                fee. Doctors cannot modify these fields through their own
                profile API.
              </div>
              <div className="md-modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
