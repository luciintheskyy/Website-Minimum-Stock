import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
    profile_picture: null,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!form.first_name) errs.first_name = "First name wajib";
    if (!form.last_name) errs.last_name = "Last name wajib";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email tidak valid";
    if (!form.password || form.password.length < 8) errs.password = "Password minimal 8 karakter";
    if (!form.password_confirmation) errs.password_confirmation = "Konfirmasi password wajib";
    if (form.password && form.password_confirmation && form.password !== form.password_confirmation) {
      errs.password_confirmation = "Konfirmasi password tidak sesuai";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
      if (form.profile_picture) fd.append("profile_picture", form.profile_picture);

      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data || {};
      const token = data.token || data.access_token || data.data?.token;
      if (token) {
        localStorage.setItem("auth_token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        toast.success("Registrasi berhasil");
        navigate("/minitok-ont/rekap", { replace: true });
      } else {
        toast.success("Registrasi berhasil, silakan login");
        navigate("/login", { replace: true });
      }
    } catch (e) {
      const resp = e.response;
      if (resp && resp.status === 422 && resp.data?.errors) {
        const beErrors = {};
        Object.entries(resp.data.errors).forEach(([key, arr]) => {
          beErrors[key] = Array.isArray(arr) ? arr[0] : String(arr);
        });
        setFieldErrors(beErrors);
        toast.error(Object.values(beErrors)[0] || resp.data.message || "Validasi gagal");
      } else {
        const msg = resp?.data?.message || e.message || "Registrasi gagal";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 520 }}>
      <div className="bg-white table-container-rounded p-4">
        <h4 className="mb-3">Register</h4>
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
            <div className="col-12">
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
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((s) => !s)}>
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
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirm((s) => !s)}>
                <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {fieldErrors.password_confirmation && <small className="text-danger">{fieldErrors.password_confirmation}</small>}
          </div>
          <div className="col-12">
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

          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-danger" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </button>
            <Link to="/login" className="btn btn-link">Sudah punya akun?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}