# BRAVOS – Medical Records & Prescriptions Frontend Integration

This bundle is based on the uploaded `hospital.zip` project. It adds the missing React pages and connects them to the clinical API already present in the backend.

## Added / updated files

- `src/components/ClinicalPages.jsx` – Medical Records and Prescriptions pages.
- `src/components/ClinicalPages.css` – page styling.
- `src/App.js` – routes for patient, doctor, and admin views.
- `src/components/PatientDashboard.jsx` – live MongoDB counts for medical records and prescriptions.
- `src/components/AdminDashboard.jsx` – admin navigation link for prescriptions.
- `backend/controllers/appointmentController.js` – populate patient details in appointment list so doctors can select their assigned patients.
- `backend/controllers/clinicalController.js` – whitelist fields accepted when creating clinical records/prescriptions.
- `backend/models/Prescription.js` – require at least one medicine.

## Installation

1. Back up your current project.
2. Extract this ZIP.
3. Copy the contents of the extracted `hospital` folder into your project folder, allowing the included files to replace the matching files.
4. **Do not replace or share your existing `.env` file.** This bundle intentionally does not include secrets or `.env`.
5. In the backend folder, ensure your existing `server.js` mounts the clinical routes:
   `app.use("/api/clinical", clinicalRoutes);`
   The uploaded project already had this mount and the clinical models/routes.
6. Restart backend and frontend:
   - Backend: `npm run dev` (or your existing backend start command)
   - Frontend: `npm start`

## Routes

| Role | Medical records | Prescriptions |
|---|---|---|
| Patient | `/medical-records` | `/prescriptions` |
| Doctor | `/doctor/records` | `/doctor/prescriptions` |
| Admin | `/admin/records` | `/admin/prescriptions` |

## Behaviour

- Patients can view only their own clinical records and prescriptions.
- Doctors can view records for patients linked through their appointments and create entries for those patients.
- Doctors can delete only entries they authored.
- Admin can view all entries and delete entries.
- Doctor patient selectors are populated from the doctor's appointment list.

## API endpoints used

- `GET /api/clinical/records`
- `POST /api/clinical/records` (doctor only)
- `DELETE /api/clinical/records/:id` (doctor/admin)
- `GET /api/clinical/prescriptions`
- `POST /api/clinical/prescriptions` (doctor only)
- `DELETE /api/clinical/prescriptions/:id` (doctor/admin)

The frontend sends the existing JWT from `localStorage` as a Bearer token. The API base URL continues to use `REACT_APP_API_URL` or defaults to `http://localhost:5000`.

## Important notes

- This implements URL-based document references only. It does not implement file upload/storage.
- Doctors need an appointment relationship with a patient before that patient appears in the selector or can be assigned a record.
- No live MongoDB/API integration test was possible from this bundle; test with your own backend and database after applying the files.
