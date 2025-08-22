import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default ke ONT rekap */}
        <Route path="/" element={<Navigate to="/minitok-ont/rekap" />} />

        {/* Minitok ONT */}
        <Route path="/minitok-ont/:subtab" element={<Dashboard />} />

        {/* Minitok AP */}
        <Route path="/minitok-ap/:subtab" element={<Dashboard />} />

        {/* Minitok Node B */}
        <Route path="/minitok-nodeb/:subtab" element={<Dashboard />} />

        {/* Minitok ONT Entherprise */}
        <Route path="/minitok-ontentherprise/:subtab" element={<Dashboard />} />

        {/* Minitok Request Outbond */}
        <Route path="/request-outbond" element={<Dashboard />} />

        {/* Minitok User List */}
        <Route path="/request-userlist" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
