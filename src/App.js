import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div>
      {/* Simple auth bar with logout */}
      <AuthBar />
      {children}
    </div>
  );
}

function AuthBar() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const token = localStorage.getItem("auth_token");
  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // ignore; just clear token
    }
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };
  return (
    <div className="d-flex justify-content-end align-items-center p-2" style={{ background: "#f8f9fa" }}>
      <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("auth_token") || "");

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    // Response interceptor to handle 401
    const id = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        if (error.response && error.response.status === 401) {
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("auth_token");
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, [token]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/minitok-ont/rekap" />} />

        {/* Notifications (Messages only) */}
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

        {/* Protected Dashboard routes */}
        <Route path="/minitok-ont/:subtab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Minitok AP */}
        <Route path="/minitok-ap/:subtab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Minitok Node B */}
        <Route path="/minitok-nodeb/:subtab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Minitok ONT Entherprise */}
        <Route path="/minitok-ontentherprise/:subtab" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Minitok Request Outbond */}
        <Route path="/request-outbond" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Minitok User List */}
        <Route path="/request-userlist" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="light" />
    </Router>
  );
}
