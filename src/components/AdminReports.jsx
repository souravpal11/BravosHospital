import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import "./AdminReports.css";

const columns = {
  patients: ["name", "email", "phone", "age", "gender", "createdAt"],
  doctors: [
    "name",
    "email",
    "phone",
    "specialization",
    "experience",
    "isActive",
    "createdAt",
  ],
  appointments: [
    "name",
    "email",
    "phone",
    "department",
    "doctor",
    "date",
    "time",
    "status",
    "appointmentFee",
    "attendanceStatus",
    "cancelledBy",
    "cancelledAt",
  ],
  medicalRecords: [
    "title",
    "recordType",
    "patient",
    "doctor",
    "diagnosis",
    "recordedAt",
  ],
  prescriptions: [
    "patient",
    "doctor",
    "diagnosis",
    "status",
    "prescribedAt",
    "medications",
  ],
};
const label = (key) =>
  ({
    createdAt: "Registered",
    specialization: "Specialization",
    experience: "Experience (yrs)",
    isActive: "Active",
    attendanceStatus: "Attendance",
    cancelledBy: "Cancelled by",
    cancelledAt: "Cancelled at",
    recordType: "Record type",
    recordedAt: "Recorded at",
    prescribedAt: "Prescribed at",
  })[key] ||
  key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const valueOf = (row, key) => {
  let value = row[key];
  if (key === "appointmentFee") value = row.doctor?.fees;
  if (key === "doctor" || key === "patient")
    value = value?.name || (typeof value === "string" ? value : "—");
  if (key === "appointmentFee" && value !== undefined && value !== null)
    value = `₹${Number(value).toLocaleString("en-IN")}`;
  if (key === "medications")
    value = Array.isArray(value)
      ? value.map((m) => `${m.name} (${m.dosage || ""})`).join("; ")
      : "—";
  if (
    ["createdAt", "recordedAt", "prescribedAt", "cancelledAt"].includes(key) &&
    value
  )
    value = new Date(value).toLocaleString("en-IN");
  if (key === "isActive") value = value ? "Yes" : "No";
  return value ?? "—";
};

export default function AdminReports() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    type: "overview",
    status: "all",
    doctorId: "all",
  });
  const [report, setReport] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("token");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v),
      );
      const { data } = await api.get("/api/admin/reports", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load report data. Check your admin login and backend connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);
  useEffect(() => {
    api
      .get("/api/doctors", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.doctors || [];
        setDoctors(list);
      })
      .catch(() => setDoctors([]));
  }, [token]);

  const sections = useMemo(() => {
    if (!report) return [];
    const d = report.data || {};
    const types =
      filters.type === "overview"
        ? [
            "patients",
            "doctors",
            "appointments",
            "medicalRecords",
            "prescriptions",
          ]
        : [filters.type === "records" ? "medicalRecords" : filters.type];
    return types.map((type) => ({
      type,
      rows: d[type] || [],
      cols: columns[type] || [],
    }));
  }, [report, filters.type]);

  const exportCSV = () => {
    if (!report) return;
    const rows = [];
    sections.forEach(({ type, rows: dataRows, cols }) => {
      rows.push([type.toUpperCase()], cols.map(label));
      dataRows.forEach((row) =>
        rows.push(cols.map((key) => valueOf(row, key))),
      );
      rows.push([]);
    });
    const csv = rows
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bravos-hospital-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="br-report-page">
      <main className="br-report-main">
        <header className="br-report-heading">
          <div>
            <span>BRAVOS / ADMINISTRATION</span>
            <h1>Reports & Audit Centre</h1>
            <p>Review hospital operations and prepare records for audit.</p>
          </div>
          <div className="br-report-actions">
            <Link to="/admin-dashboard" className="back-dashboard-btn">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <button onClick={loadReport} disabled={loading}>
              <i className="bi bi-arrow-clockwise" /> Refresh
            </button>
            <button onClick={() => window.print()} disabled={!report}>
              <i className="bi bi-file-earmark-pdf" /> Print / Save PDF
            </button>
            <button className="primary" onClick={exportCSV} disabled={!report}>
              <i className="bi bi-file-earmark-spreadsheet" /> Export Excel
              (CSV)
            </button>
          </div>
        </header>
        <section className="br-report-filter">
          <div>
            <b>
              <i className="bi bi-funnel" /> Report filters
            </b>
            <small>Choose the records and period to include.</small>
          </div>
          <label>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((f) => ({ ...f, from: e.target.value }))
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((f) => ({ ...f, to: e.target.value }))
              }
            />
          </label>
          <label>
            Report type
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
            >
              <option value="overview">Complete overview</option>
              <option value="patients">Patient registrations</option>
              <option value="doctors">Doctor directory</option>
              <option value="appointments">Appointment history</option>
              <option value="records">Medical records</option>
              <option value="prescriptions">Prescriptions</option>
            </select>
          </label>
          <label>
            Appointment status
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Doctor
            <select
              value={filters.doctorId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, doctorId: e.target.value }))
              }
            >
              <option value="all">All doctors</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </label>
        </section>
        {error && <div className="br-report-error">{error}</div>}
        {loading && (
          <div className="br-report-loading">
            <span className="spinner-border spinner-border-sm" /> Preparing your
            report…
          </div>
        )}
        {report && (
          <>
            <section className="br-report-kpis">
              {[
                ["Patients", report.statistics.totalPatients, "people"],
                ["Doctors", report.statistics.totalDoctors, "person-badge"],
                [
                  "Appointments",
                  report.statistics.totalAppointments,
                  "calendar-check",
                ],
                [
                  "Approved",
                  report.statistics.approvedAppointments,
                  "calendar-check-fill",
                ],
                [
                  "Estimated Income",
                  `₹${Number(report.statistics.totalIncome || 0).toLocaleString("en-IN")}`,
                  "currency-rupee",
                ],
                [
                  "Completed",
                  report.statistics.completedAppointments,
                  "check-circle",
                ],
                ["Pending", report.statistics.pendingAppointments, "clock"],
                [
                  "Cancelled",
                  report.statistics.cancelledAppointments,
                  "calendar-x",
                ],
              ].map(([name, count, icon]) => (
                <article key={name}>
                  <i className={`bi bi-${icon}`} />
                  <span>{name}</span>
                  <strong>{count ?? 0}</strong>
                </article>
              ))}
            </section>
            <div className="br-report-meta">
              <span>
                <i className="bi bi-shield-check" /> Administrative report
              </span>
              <span>
                Generated:{" "}
                {new Date(report.generatedAt).toLocaleString("en-IN")}
              </span>
              <span>
                Income = sum of doctor fees for approved appointments in the
                selected date/doctor range
              </span>
            </div>
            {sections.map(({ type, rows, cols }) => (
              <section className="br-report-table-card" key={type}>
                <div className="br-report-table-title">
                  <div>
                    <small>RECORD REGISTER</small>
                    <h2>
                      {type === "medicalRecords"
                        ? "Medical Records"
                        : type === "prescriptions"
                          ? "Prescriptions"
                          : label(type)}
                    </h2>
                  </div>
                  <span>{rows.length} records returned</span>
                </div>
                {rows.length ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          {cols.map((col) => (
                            <th key={col}>{label(col)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row._id}>
                            {cols.map((col) => (
                              <td key={col}>{String(valueOf(row, col))}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="br-report-empty">
                    No records found for the selected filters.
                  </div>
                )}
              </section>
            ))}
            <section className="br-audit-note">
              <i className="bi bi-info-circle" />
              <div>
                <b>Audit trail limitation</b>
                <p>
                  This report shows stored records, creation/update timestamps
                  and cancellation fields currently available in BRAVOS. A
                  complete immutable audit trail (who changed each field,
                  previous value, new value and exact action time) requires a
                  dedicated audit-log collection and recording changes at the
                  time they happen. Historical actions that were not logged
                  cannot be reconstructed.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
