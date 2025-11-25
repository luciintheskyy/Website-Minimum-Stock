import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function AddUser({ onSaved, onCancel }) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errorRoles, setErrorRoles] = useState(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    role_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    profile_picture: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      setErrorRoles(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/roles`);
        setRoles(res.data?.data || []);
      } catch (e) {
        console.error(e);
        setErrorRoles("Gagal memuat roles");
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setForm((prev) => ({ ...prev, profile_picture: file || null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name || form.first_name.length > 100) errs.first_name = "First name wajib, maks 100";
    if (!form.last_name || form.last_name.length > 100) errs.last_name = "Last name wajib, maks 100";
    if (!form.address || form.address.length > 255) errs.address = "Address wajib, maks 255";
    if (!form.phone || form.phone.length > 25) errs.phone = "Phone wajib, maks 25";
    if (!form.role_id) errs.role_id = "Role wajib";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email tidak valid";
    if (!form.password || form.password.length < 8) errs.password = "Password minimal 8 karakter";
    if (!form.password_confirmation) errs.password_confirmation = "Konfirmasi password wajib";
    if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
      errs.password_confirmation = "Konfirmasi password tidak sesuai";
    }
    return errs;
  };

  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await Swal.fire({
      title: "Simpan User?",
      text: "Pastikan data sudah benar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("address", form.address);
      fd.append("phone", form.phone);
      fd.append("role_id", form.role_id);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
      if (form.profile_picture) fd.append("profile_picture", form.profile_picture);

      await axios.post(`${API_BASE_URL}/api/users`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("User berhasil ditambahkan");
      if (onSaved) onSaved();
    } catch (e) {
      console.error(e);
      const resp = e.response;
      if (resp && resp.status === 422 && resp.data?.errors) {
        const beErrors = {};
        Object.entries(resp.data.errors).forEach(([key, arr]) => {
          beErrors[key] = Array.isArray(arr) ? arr[0] : String(arr);
        });
        setFieldErrors(beErrors);
        toast.error(Object.values(beErrors)[0] || resp.data.message || "Validasi gagal");
      } else {
        const msg = resp?.data?.message || e.message || "Gagal menyimpan user";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 mb-4">
      <div className="bg-white table-container-rounded p-3">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="m-0">Add User</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-danger" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className={`form-control ${fieldErrors.first_name ? 'is-invalid' : ''}`} />
              {fieldErrors.first_name && <small className="text-danger">{fieldErrors.first_name}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className={`form-control ${fieldErrors.last_name ? 'is-invalid' : ''}`} />
              {fieldErrors.last_name && <small className="text-danger">{fieldErrors.last_name}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Asal</label>
              <input name="address" value={form.address} onChange={handleChange} className={`form-control ${fieldErrors.address ? 'is-invalid' : ''}`} />
              {fieldErrors.address && <small className="text-danger">{fieldErrors.address}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`} />
              {fieldErrors.phone && <small className="text-danger">{fieldErrors.phone}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select name="role_id" value={form.role_id} onChange={handleChange} className={`form-select ${fieldErrors.role_id ? 'is-invalid' : ''}`}>
                <option value="">Pilih Role</option>
                {loadingRoles && <option disabled>Loading...</option>}
                {errorRoles && <option disabled>Gagal memuat roles</option>}
                {!loadingRoles && roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>{r.name}</option>
                ))}
              </select>
              {fieldErrors.role_id && <small className="text-danger">{fieldErrors.role_id}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`} />
              {fieldErrors.email && <small className="text-danger">{fieldErrors.email}</small>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {fieldErrors.password && <small className="text-danger">{fieldErrors.password}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Konfirmasi Password</label>
              <div className="input-group">
                <input
                  name="password_confirmation"
                  type={showConfirm ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  className={`form-control ${fieldErrors.password_confirmation ? 'is-invalid' : ''}`}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  aria-label="Toggle confirm password visibility"
                  onClick={() => setShowConfirm((s) => !s)}
                >
                  <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {fieldErrors.password_confirmation && <small className="text-danger">{fieldErrors.password_confirmation}</small>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Profile Picture</label>
              <input
                name="profile_picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`form-control ${fieldErrors.profile_picture ? 'is-invalid' : ''}`}
              />
              {fieldErrors.profile_picture && <small className="text-danger">{fieldErrors.profile_picture}</small>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}