import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./style.css";
import { postActivityLog } from "../api/activityLogs";

export default function Login() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email tidak valid";
    if (!form.password || form.password.length < 8) errs.password = "Password minimal 8 karakter";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });
      const data = res.data || {};
      const token = data.token || data.access_token || data.data?.token;
      if (!token) {
        toast.error("Token tidak ditemukan pada response");
      } else {
        localStorage.setItem("auth_token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        toast.success("Login berhasil");
        try {
          const meRes = await axios.get(`${API_BASE_URL}/api/me`);
          const me = meRes.data?.user;
          if (me?.id) {
            try { localStorage.setItem("current_user_id", String(me.id)); } catch (_) {}
            await postActivityLog({ user_id: me.id, activity: "Login aplikasi", timestamp: new Date().toISOString() });
          }
        } catch (_) {}
        navigate("/minitok-ont/rekap", { replace: true });
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
        const msg = resp?.data?.message || e.message || "Login gagal";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split">
      {/* Left: Form */}
      <div className="login-left">
        <div className="login-form-box">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
              />
              {fieldErrors.email && (
                <small className="text-danger">{fieldErrors.email}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
              />
              {fieldErrors.password && (
                <small className="text-danger">{fieldErrors.password}</small>
              )}
            </div>

            <button className="btn btn-danger login-button" type="submit" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Right: Image */}
      <div className="login-right">
        <img src="/assets/TelkomTower.jpg" alt="Telkom Tower" className="login-image" />
      </div>
    </div>
  );
}