import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/api";
import "./MyProfile.css";

const roleFields = {
  patient: [
    { key: "name", label: "Full name", required: true },
    { key: "phone", label: "Phone number", required: true },
    { key: "age", label: "Age", type: "number", required: true },
    { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
  ],
  doctor: [
    { key: "name", label: "Full name", required: true },
    { key: "phone", label: "Phone number", required: true },
    { key: "specialization", label: "Specialization", required: true },
    { key: "qualification", label: "Qualification", required: true },
    { key: "gender", label: "Gender", required: true },
  ],
  admin: [{ key: "name", label: "Full name", required: true }],
};

const roleHome = {
  patient: "/patient-dashboard",
  doctor: "/doctor-dashboard",
  admin: "/admin-dashboard",
};

const MyProfile = () => {
  const role = sessionStorage.getItem("role") || "";
  const navigate = useNavigate();
  const fields = roleFields[role] || [];
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleLabel = useMemo(() => role ? role[0].toUpperCase() + role.slice(1) : "Account", [role]);

  useEffect(() => {
    if (!roleHome[role] || !sessionStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }
    let active = true;
    api.get("/api/profile/me", {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    }).then(({ data }) => {
      if (!active) return;
      setProfile(data.profile || {});
      setForm(data.profile || {});
      setPreview(data.profile?.image || "");
    }).catch((err) => {
      if (!active) return;
      setError(err.response?.data?.message || "Unable to load your profile.");
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [role, navigate]);

  const handlePhoto = (file) => {
    setError("");
    setMessage("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be smaller than 5 MB.");
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = new FormData();
      fields.forEach(({ key }) => payload.append(key, form[key] ?? ""));
      if (photo) payload.append("image", photo);
      const { data } = await api.patch("/api/profile/me", payload, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const updated = data.profile || {};
      setProfile(updated);
      setForm(updated);
      setPreview(updated.image || "");
      setPhoto(null);
      const storageKey = role === "admin" ? "admin" : role;
      const oldUser = JSON.parse(sessionStorage.getItem(storageKey) || "{}");
      sessionStorage.setItem(storageKey, JSON.stringify({ ...oldUser, ...updated }));
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const imageSrc = preview
    ? (/^https?:\/\//i.test(preview) ? preview : `${api.defaults.baseURL}/${preview.replace(/^\/+/, "")}`)
    : "";

  if (loading) return <div className="my-profile-loading"><div className="spinner-border text-primary" /><p>Loading your profile...</p></div>;

  return (
    <main className="my-profile-page">
      <div className="my-profile-shell">
        <div className="my-profile-top">
          <Link to={roleHome[role] || "/"} className="profile-back-link"><i className="bi bi-arrow-left" /> Back to dashboard</Link>
          <span className="profile-role-chip">{roleLabel} Portal</span>
        </div>

        <section className="my-profile-card">
          <div className="my-profile-heading">
            <div>
              <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
              <h1>My Profile</h1>
              <p>Manage your personal information and profile photo.</p>
            </div>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-photo-section">
              <div className="profile-photo-frame">
                {imageSrc ? <img src={imageSrc} alt="Profile" /> : <span>{(form.name || roleLabel).charAt(0).toUpperCase()}</span>}
              </div>
              <div className="profile-photo-controls">
                <h3>Profile photo</h3>
                <p>JPG, PNG or WEBP. Maximum file size: 5 MB.</p>
                <label className="profile-upload-btn">
                  <i className="bi bi-camera" /> Choose photo
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                </label>
                {photo && <button type="button" className="profile-clear-photo" onClick={() => { setPhoto(null); setPreview(profile.image || ""); }}>Discard selection</button>}
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="profile-field">
                <label>Email address</label>
                <input className="form-control" value={form.email || ""} disabled />
                <small>Email address cannot be changed here.</small>
              </div>
              {fields.map((field) => (
                <div className="profile-field" key={field.key}>
                  <label htmlFor={`profile-${field.key}`}>{field.label}</label>
                  {field.type === "select" ? (
                    <select id={`profile-${field.key}`} className="form-select" value={form[field.key] || ""} required={field.required} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}>
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input id={`profile-${field.key}`} className="form-control" type={field.type || "text"} min={field.type === "number" ? "0" : undefined} value={form[field.key] ?? ""} required={field.required} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} />
                  )}
                </div>
              ))}
            </div>

            <div className="profile-form-footer">
              <span><i className="bi bi-shield-check" /> Your account email and password are not changed.</span>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : <><i className="bi bi-check2-circle" /> Save changes</>}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default MyProfile;
