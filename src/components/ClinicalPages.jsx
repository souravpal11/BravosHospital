import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../config/api";
import "./ClinicalPages.css";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("token") || ""}` },
});
const role = () => sessionStorage.getItem("role") || "patient";
const dateLabel = value => value ? new Date(value).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

export function MedicalRecords() {
  const currentRole = role();
  const canCreate = currentRole === "doctor";
  const canDelete = currentRole === "doctor" || currentRole === "admin";
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [hospitalDoctors, setHospitalDoctors] = useState([]);
  const [shareDoctorId, setShareDoctorId] = useState("");
  const [sharingId, setSharingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ patient:"", title:"", recordType:"consultation", diagnosis:"", notes:"", fileUrl:"" });
  const [uploadForm, setUploadForm] = useState({ title:"", recordType:"lab_report", prescribedBy:"", notes:"", report:null });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [recordsResponse, appointmentsResponse, doctorsResponse] = await Promise.all([
        api.get("/api/clinical/records", authConfig()),
        canCreate ? api.get("/api/appointments", authConfig()) : Promise.resolve({ data: { appointments: [] } }),
        currentRole === "patient" ? api.get("/api/clinical/doctors", authConfig()) : Promise.resolve({ data: { doctors: [] } })
      ]);
      setItems(recordsResponse.data.records || []);
      setHospitalDoctors(doctorsResponse.data.doctors || []);
      const appts = appointmentsResponse.data.appointments || [];
      const unique = new Map();
      appts.forEach(a => {
        if (!a.patient) return;
        const patientId = typeof a.patient === "object" ? a.patient._id : a.patient;
        if (!patientId) return;
        unique.set(patientId, {
          _id: patientId,
          name: (typeof a.patient === "object" && a.patient.name) || a.name || "Unknown Patient",
          email: (typeof a.patient === "object" && a.patient.email) || a.email || "",
        });
      });
      setPatients(Array.from(unique.values()));
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load medical records. Please check your login and backend.");
    } finally { setLoading(false); }
  }, [canCreate, currentRole]);

  useEffect(() => { load(); }, [load]);

  const update = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const updateUpload = e => setUploadForm(prev => ({ ...prev, [e.target.name]: e.target.name === "report" ? e.target.files?.[0] || null : e.target.value }));
  const uploadReport = async e => {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const data = new FormData();
      data.append("title", uploadForm.title || uploadForm.report?.name || "Medical report");
      data.append("recordType", uploadForm.recordType);
      data.append("prescribedBy", uploadForm.prescribedBy);
      data.append("notes", uploadForm.notes);
      data.append("report", uploadForm.report);
      await api.post("/api/clinical/records/upload", data, authConfig());
      setUploadForm({ title:"", recordType:"lab_report", prescribedBy:"", notes:"", report:null });
      const fileInput = document.getElementById("patient-report-file");
      if (fileInput) fileInput.value = "";
      setNotice("Your report was uploaded successfully.");
      await load();
    } catch (e) { setError(e.response?.data?.message || "Could not upload your report."); }
    finally { setSaving(false); }
  };
  const shareReport = async recordId => {
    if (!shareDoctorId) { setError("Please select a doctor first."); return; }
    setSharingId(recordId); setError(""); setNotice("");
    try {
      await api.post(`/api/clinical/records/${recordId}/share`, { doctorId: shareDoctorId }, authConfig());
      setNotice("Report shared securely with the selected doctor.");
      setShareDoctorId("");
      await load();
    } catch (e) { setError(e.response?.data?.message || "Could not share this report."); }
    finally { setSharingId(""); }
  };
  const downloadFile = async item => {
    try {
      const response = await api.get(item.fileUrl, { ...authConfig(), responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = item.fileName || `${item.title || "medical-report"}`;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) { setError(e.response?.data?.message || "Unable to download this report."); }
  };
  const submit = async e => {
    e.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      await api.post("/api/clinical/records", form, authConfig());
      setForm({ patient:"", title:"", recordType:"consultation", diagnosis:"", notes:"", fileUrl:"" });
      setNotice("Clinical report saved successfully.");
      await load();
    } catch (e) { setError(e.response?.data?.message || "Could not save this clinical report."); }
    finally { setSaving(false); }
  };
  const remove = async id => {
    if (!window.confirm("Delete this clinical report? This cannot be undone.")) return;
    try { await api.delete(`/api/clinical/records/${id}`, authConfig()); setItems(v => v.filter(x => x._id !== id)); }
    catch (e) { setError(e.response?.data?.message || "Could not delete report."); }
  };

  return <div className="clinical-page">
    <header className="clinical-header">
      <div><span className="clinical-eyebrow">BRAVOS HEALTHCARE</span><h1>Medical Reports</h1><p>Upload your reports and choose which hospital doctor can view them.</p></div>
      <Link to={currentRole === "doctor" ? "/doctor-dashboard" : currentRole === "admin" ? "/admin-dashboard" : "/patient-dashboard"} className="clinical-back"><i className="bi bi-arrow-left"/> Dashboard</Link>
    </header>
    {error && <div className="alert alert-danger">{error}</div>}
    {notice && <div className="alert alert-success">{notice}</div>}
    {currentRole === "patient" && <section className="clinical-panel mb-4">
      <div className="clinical-panel-heading"><div><span>UPLOAD DOCUMENT</span><h2>Upload Your Medical Report</h2></div></div>
      <form onSubmit={uploadReport} className="row g-3">
        <div className="col-md-6"><label className="form-label">Report title</label><input className="form-control" name="title" value={uploadForm.title} onChange={updateUpload} maxLength="160" placeholder="e.g. Complete Blood Count"/></div>
        <div className="col-md-6"><label className="form-label">Report type *</label><select className="form-select" name="recordType" value={uploadForm.recordType} onChange={updateUpload} required><option value="lab_report">Lab report</option><option value="imaging">X-ray / MRI / CT scan</option><option value="discharge_summary">Discharge summary</option><option value="other">Other</option></select></div>
        <div className="col-md-6"><label className="form-label">Prescribed by Doctor (optional)</label><input className="form-control" type="text" name="prescribedBy" value={uploadForm.prescribedBy} onChange={updateUpload} maxLength="120" placeholder="e.g. Dr. Amit Sharma"/><small className="text-muted">Enter the name of the doctor who prescribed this test or report, including a doctor outside BRAVOS.</small></div>
        <div className="col-12"><label className="form-label">Choose report (PDF, JPG or PNG; max 10 MB) *</label><input id="patient-report-file" className="form-control" type="file" name="report" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={updateUpload} required/><small className="text-muted">Upload a clear scan or photograph of your report.</small></div>
        <div className="col-12"><label className="form-label">Notes (optional)</label><textarea className="form-control" rows="2" name="notes" value={uploadForm.notes} onChange={updateUpload} maxLength="3000" placeholder="Add a note for your doctor"/></div>
        <div className="col-12"><button className="btn btn-primary" disabled={saving || !uploadForm.report}><i className="bi bi-cloud-arrow-up me-1"/>{saving ? "Uploading..." : "Upload Report"}</button></div>
      </form>
    </section>}
    {canCreate && <section className="clinical-panel mb-4">
      <div className="clinical-panel-heading"><div><span>NEW ENTRY</span><h2>Add Clinical Report</h2></div></div>
      <form onSubmit={submit} className="row g-3">
        <div className="col-md-6"><label className="form-label">Patient *</label><select className="form-select" name="patient" value={form.patient} onChange={update} required><option value="">Select patient</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name} {p.email ? `(${p.email})` : ""}</option>)}</select>{patients.length===0 && <small className="text-muted">Patients with appointments assigned to you appear here.</small>}</div>
        <div className="col-md-6"><label className="form-label">Record title *</label><input className="form-control" name="title" value={form.title} onChange={update} maxLength="160" required placeholder="e.g. General consultation"/></div>
        <div className="col-md-4"><label className="form-label">Record type</label><select className="form-select" name="recordType" value={form.recordType} onChange={update}><option value="consultation">Consultation</option><option value="lab_report">Lab report</option><option value="imaging">Imaging</option><option value="discharge_summary">Discharge summary</option><option value="other">Other</option></select></div>
        <div className="col-md-8"><label className="form-label">Diagnosis</label><input className="form-control" name="diagnosis" value={form.diagnosis} onChange={update} placeholder="Diagnosis or clinical impression"/></div>
        <div className="col-12"><label className="form-label">Clinical notes</label><textarea className="form-control" rows="3" name="notes" value={form.notes} onChange={update} placeholder="Add relevant observations and care notes"/></div>
        <div className="col-md-8"><label className="form-label">Document URL (optional)</label><input className="form-control" type="url" name="fileUrl" value={form.fileUrl} onChange={update} placeholder="https://..."/></div>
        <div className="col-12"><button className="btn btn-primary" disabled={saving || !patients.length}>{saving ? "Saving..." : "Save Medical Record"}</button></div>
      </form>
    </section>}
    <section className="clinical-panel">
      <div className="clinical-panel-heading"><div><span>YOUR DOCUMENT LIBRARY</span><h2>{currentRole === "patient" ? "Your Medical Reports" : "Medical Reports Shared With You"}</h2></div><button className="btn btn-outline-primary btn-sm" onClick={load} disabled={loading}><i className="bi bi-arrow-clockwise me-1"/>Refresh</button></div>
      {loading ? <div className="clinical-empty">Loading medical reports...</div> : items.length === 0 ? <div className="clinical-empty"><i className="bi bi-file-earmark-medical"/><h3>No medical reports yet</h3><p>Uploaded reports and reports shared by your care team will appear here.</p></div> :
        <div className="clinical-list">{items.map(item=><article className="clinical-item" key={item._id}>
          <div className="clinical-item-icon"><i className="bi bi-file-medical"/></div><div className="clinical-item-content">
            <div className="clinical-item-top"><h3>{item.title}</h3><span className="clinical-pill">{String(item.recordType || "other").replaceAll("_"," ")}</span></div>
            <p className="clinical-meta">{currentRole !== "patient" && <>Patient: <strong>{item.patient?.name || "—"}</strong> · </>}{item.uploadedByRole === "patient" ? <>Prescribed by: <strong>{item.prescribedBy || "Not specified"}</strong> · </> : <>Doctor: <strong>{item.doctor?.name || "—"}</strong> · </>}{dateLabel(item.recordedAt || item.createdAt)}</p>
            {item.diagnosis && <p><strong>Diagnosis:</strong> {item.diagnosis}</p>}{item.notes && <p className="clinical-notes">{item.notes}</p>}
            {item.fileUrl && (item.fileUrl.startsWith("/api/clinical/records/") ? <button type="button" className="btn btn-link p-0" onClick={()=>downloadFile(item)}>Download report <i className="bi bi-download"/></button> : <a href={item.fileUrl} target="_blank" rel="noreferrer">Open attached document <i className="bi bi-box-arrow-up-right"/></a>)}
            {item.fileName && <small className="d-block text-muted mt-1">{item.fileName} · {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}</small>}
            {currentRole === "patient" && item.uploadedByRole === "patient" && item.fileUrl && <div className="d-flex flex-wrap gap-2 align-items-center mt-3">
              <select className="form-select form-select-sm" style={{maxWidth:"280px"}} value={shareDoctorId} onChange={e=>setShareDoctorId(e.target.value)} aria-label="Choose doctor to share report">
                <option value="">Choose a hospital doctor...</option>
                {hospitalDoctors.map(d=><option key={d._id} value={d._id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ""}</option>)}
              </select>
              <button type="button" className="btn btn-sm btn-outline-primary" disabled={!shareDoctorId || sharingId===item._id || hospitalDoctors.length===0} onClick={()=>shareReport(item._id)}>
                {sharingId===item._id ? "Sharing..." : "Send to Doctor"}
              </button>
              {Array.isArray(item.sharedWithDoctors) && item.sharedWithDoctors.length>0 && <small className="text-muted">Already shared with: {item.sharedWithDoctors.map(d=>d.name).filter(Boolean).join(", ")}</small>}
            </div>}
          </div>{canDelete && <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(item._id)} aria-label="Delete record"><i className="bi bi-trash"/></button>}
        </article>)}</div>}
    </section>
  </div>;
}

export function Prescriptions() {
  const currentRole = role();
  const canCreate = currentRole === "doctor";
  const canDelete = currentRole === "doctor" || currentRole === "admin";
  const [items,setItems] = useState([]); const [patients,setPatients] = useState([]);
  const [loading,setLoading] = useState(true); const [saving,setSaving] = useState(false);
  const [error,setError] = useState(""); const [notice,setNotice] = useState("");
  const [form,setForm] = useState({ patient:"", diagnosis:"", notes:"", validUntil:"", medications:[{name:"",dosage:"",frequency:"",duration:"",instructions:""}] });
  const load = useCallback(async()=>{
    setLoading(true); setError("");
    try {
      const [r,a] = await Promise.all([api.get("/api/clinical/prescriptions",authConfig()), canCreate ? api.get("/api/appointments",authConfig()) : Promise.resolve({data:{appointments:[]}})]);
      setItems(r.data.prescriptions || []);
      const unique = new Map(); (a.data.appointments || []).forEach(x=>{if(!x.patient)return;const id=typeof x.patient==="object"?x.patient._id:x.patient;if(!id)return;unique.set(id,{_id:id,name:(typeof x.patient==="object"&&x.patient.name)||x.name||"Unknown Patient",email:(typeof x.patient==="object"&&x.patient.email)||x.email||""});});
      setPatients(Array.from(unique.values()));
    } catch(e){setError(e.response?.data?.message || "Unable to load prescriptions. Please check your login and backend.");}
    finally{setLoading(false);}
  },[canCreate]);
  useEffect(()=>{load();},[load]);
  const setField=e=>setForm(v=>({...v,[e.target.name]:e.target.value}));
  const setMedication=(i,key,value)=>setForm(v=>({...v,medications:v.medications.map((m,index)=>index===i?{...m,[key]:value}:m)}));
  const addMedication=()=>setForm(v=>({...v,medications:[...v.medications,{name:"",dosage:"",frequency:"",duration:"",instructions:""}]}));
  const removeMedication=i=>setForm(v=>({...v,medications:v.medications.filter((_,index)=>index!==i)}));
  const submit=async e=>{
    e.preventDefault();setSaving(true);setError("");setNotice("");
    try{await api.post("/api/clinical/prescriptions",form,authConfig());setForm({patient:"",diagnosis:"",notes:"",validUntil:"",medications:[{name:"",dosage:"",frequency:"",duration:"",instructions:""}]});setNotice("Prescription saved successfully.");await load();}
    catch(e){setError(e.response?.data?.message || "Could not save prescription.");}finally{setSaving(false);}
  };
  const remove=async id=>{if(!window.confirm("Delete this prescription? This cannot be undone."))return;try{await api.delete(`/api/clinical/prescriptions/${id}`,authConfig());setItems(v=>v.filter(x=>x._id!==id));}catch(e){setError(e.response?.data?.message || "Could not delete prescription.");}};
  return <div className="clinical-page">
    <header className="clinical-header"><div><span className="clinical-eyebrow">BRAVOS HEALTHCARE</span><h1>Prescriptions</h1><p>Review prescribed medicines and instructions.</p></div><Link to={currentRole==="doctor"?"/doctor-dashboard":currentRole==="admin"?"/admin-dashboard":"/patient-dashboard"} className="clinical-back"><i className="bi bi-arrow-left"/> Dashboard</Link></header>
    {error && <div className="alert alert-danger">{error}</div>}{notice && <div className="alert alert-success">{notice}</div>}
    {/* Patient report uploads are handled on the Medical Records page. */}
    {canCreate && <section className="clinical-panel mb-4"><div className="clinical-panel-heading"><div><span>NEW PRESCRIPTION</span><h2>Create Prescription</h2></div></div>
      <form onSubmit={submit} className="row g-3">
        <div className="col-md-6"><label className="form-label">Patient *</label><select className="form-select" name="patient" value={form.patient} onChange={setField} required><option value="">Select patient</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name} {p.email?`(${p.email})`:""}</option>)}</select>{patients.length===0&&<small className="text-muted">Patients with appointments assigned to you appear here.</small>}</div>
        <div className="col-md-6"><label className="form-label">Diagnosis</label><input className="form-control" name="diagnosis" value={form.diagnosis} onChange={setField} placeholder="Diagnosis"/></div>
        <div className="col-12"><div className="d-flex justify-content-between align-items-center"><label className="form-label mb-0">Medicines *</label><button type="button" className="btn btn-sm btn-outline-primary" onClick={addMedication}><i className="bi bi-plus-lg me-1"/>Add medicine</button></div></div>
        {form.medications.map((m,i)=><div className="col-12" key={i}><div className="clinical-medicine-form"><div className="d-flex justify-content-between mb-2"><strong>Medicine {i+1}</strong>{form.medications.length>1&&<button type="button" className="btn btn-sm btn-link text-danger" onClick={()=>removeMedication(i)}>Remove</button>}</div><div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Medicine name *</label>
            <input className="form-control" placeholder="e.g. Paracetamol" value={m.name} onChange={e=>setMedication(i,"name",e.target.value)} required/>
          </div>
          <div className="col-md-2">
            <label className="form-label">Dosage</label>
            <input className="form-control" placeholder="e.g. 1 tablet" value={m.dosage} onChange={e=>setMedication(i,"dosage",e.target.value)}/>
          </div>
          <div className="col-md-2">
            <label className="form-label">Frequency</label>
            <input className="form-control" placeholder="e.g. Twice daily" value={m.frequency} onChange={e=>setMedication(i,"frequency",e.target.value)}/>
          </div>
          <div className="col-md-2">
            <label className="form-label">Duration</label>
            <input className="form-control" placeholder="e.g. 5 days" value={m.duration} onChange={e=>setMedication(i,"duration",e.target.value)}/>
          </div>
          <div className="col-md-2">
            <label className="form-label">Instructions</label>
            <input className="form-control" placeholder="e.g. After meals" value={m.instructions} onChange={e=>setMedication(i,"instructions",e.target.value)}/>
          </div>
        </div></div></div>)}
        <div className="col-md-6"><label className="form-label">Valid until (optional)</label><input className="form-control" type="date" name="validUntil" value={form.validUntil} onChange={setField}/></div>
        <div className="col-12"><label className="form-label">Additional notes</label><textarea className="form-control" rows="2" name="notes" value={form.notes} onChange={setField}/></div>
        <div className="col-12"><button className="btn btn-primary" disabled={saving||!patients.length||!form.medications.some(m=>m.name.trim())}>{saving?"Saving...":"Save Prescription"}</button></div>
      </form>
    </section>}
    <section className="clinical-panel"><div className="clinical-panel-heading"><div><span>MEDICATION HISTORY</span><h2>{currentRole==="patient"?"Your Prescriptions":"Patient Prescriptions"}</h2></div><button className="btn btn-outline-primary btn-sm" onClick={load} disabled={loading}><i className="bi bi-arrow-clockwise me-1"/>Refresh</button></div>
      {loading?<div className="clinical-empty">Loading prescriptions...</div>:items.length===0?<div className="clinical-empty"><i className="bi bi-capsule"/><h3>No prescriptions yet</h3><p>Prescriptions from your healthcare team will appear here.</p></div>:
      <div className="clinical-list">{items.map(item=><article className="clinical-item" key={item._id}><div className="clinical-item-icon prescription"><i className="bi bi-capsule"/></div><div className="clinical-item-content">
        <div className="clinical-item-top"><h3>{item.diagnosis||"Prescription"}</h3><span className={`clinical-pill status-${item.status||"active"}`}>{item.status||"active"}</span></div>
        <p className="clinical-meta">{currentRole!=="patient"&&<>Patient: <strong>{item.patient?.name||"—"}</strong> · </>}Dr. <strong>{item.doctor?.name||"—"}</strong> · {dateLabel(item.prescribedAt||item.createdAt)}</p>
        <div className="clinical-medicine-list">
          {(item.medications || []).map((m, i) => (
            <div className="clinical-medicine-detail" key={i}>
              <strong className="d-block mb-2">Medicine {i + 1}: {m.name}</strong>
              <div className="row g-2">
                <div className="col-sm-4">
                  <div className="p-2 bg-light rounded h-100">
                    <small className="d-block text-muted">Dosage</small>
                    <span className="fw-semibold">{m.dosage || "Not specified"}</span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-2 bg-light rounded h-100">
                    <small className="d-block text-muted">Frequency</small>
                    <span className="fw-semibold">{m.frequency || "Not specified"}</span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="p-2 bg-light rounded h-100">
                    <small className="d-block text-muted">Duration</small>
                    <span className="fw-semibold">{m.duration || "Not specified"}</span>
                  </div>
                </div>
              </div>
              {m.instructions && <p className="mt-2 mb-0"><strong>Instructions:</strong> {m.instructions}</p>}
            </div>
          ))}
        </div>
        {item.notes&&<p className="clinical-notes">{item.notes}</p>}{item.validUntil&&<small className="text-muted">Valid until: {dateLabel(item.validUntil)}</small>}
      </div>{canDelete&&<button className="btn btn-sm btn-outline-danger" onClick={()=>remove(item._id)} aria-label="Delete prescription"><i className="bi bi-trash"/></button>}</article>)}</div>}
    </section>
  </div>;
}
