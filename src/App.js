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
        {/* Default setelah login → langsung ke Rekap */}
        <Route path="/" element={<Navigate to="/minitok-ont/rekap" />} />
        <Route path="/minitok-ont/:subtab" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
