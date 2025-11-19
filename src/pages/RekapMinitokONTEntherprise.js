import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function RekapMinitokONTEntherprise() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [counts, setCounts] = useState({ red: 0, yellow: 0, green: 0 });
  const [rows, setRows] = useState([]);

  const defaultMinStock = 215; // B
  const defaultKebutuhan = 444;
  const defaultYellowThreshold = 20;

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reports/summary`, {
          params: {
            jenis: "ONTEnterprhise",
            min_stock: defaultMinStock,
            kebutuhan: defaultKebutuhan,
            yellow_threshold: defaultYellowThreshold,
          },
        });
        const data = res.data || {};
        const lu = data.last_update || null;
        if (lu) {
          const date = new Date(lu);
          const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
          setLastUpdate(formattedDate);
        }
        setPercentage(Number(data.percentage || 0));
        setCounts({
          red: Number(data.counts?.red || 0),
          yellow: Number(data.counts?.yellow || 0),
          green: Number(data.counts?.green || 0),
        });
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e) {
        console.error(e);
        setError("Gagal memuat ringkasan ONT Entherprise");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [API_BASE_URL]);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleOptionSelect = (option) => {
    console.log("Selected:", option);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* === Cards === */}
      <div className="row g-3 py-3 mb-1">
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Percentage</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{Number(percentage).toFixed(2)}%</div>
              <img
                src="/assets/ChartBar.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Red Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.red}</div>
              <img
                src="/assets/CautionBell.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Yellow Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.yellow}</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Green Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">{counts.green}</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === Last Update & Actions === */}
      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-2">
        <div
          className="rounded px-3 py-2 text-dark small"
          style={{ backgroundColor: "#EEF2F6" }}
        >
          Last Update : {lastUpdate || "-"}
        </div>

        {/* Buttons & Dropdowns */}
        <div
          className="d-flex align-items-center gap-2 ms-auto flex-nowrap"
          ref={dropdownContainerRef}
        >
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{ width: "300px" }}
          />

          {/* TREG */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("treg")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "90px",
                height: "38px",
                border: "none",
              }}
            >
              <span>TREG</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "treg" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleOptionSelect(`TREG ${num}`)}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    TREG {num}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TA CCAN */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("taccan")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "120px",
                height: "38px",
                border: "none",
              }}
            >
              <span>TA CCAN</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "taccan" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                {["CCAN A", "CCAN B", "CCAN C"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="position-relative">
            <button
              onClick={() => toggleDropdown("export")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "130px",
                height: "38px",
                border: "none",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/TrayArrowUp.svg"
                  alt="Export"
                  style={{ width: "20px", height: "20px" }}
                />
                Export
              </div>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "export" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                {["Export Data", "Export All Data"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="position-relative">
            <button
              onClick={() => toggleDropdown("upload")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "173px",
                height: "38px",
                border: "none",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/UploadSimple.svg"
                  alt="Upload"
                  style={{ width: "20px", height: "20px" }}
                />
                Upload Data
              </div>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "upload" && (
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-102 z-3"
                style={{ right: 0, minWidth: "100%" }}
              >
                {[
                  "Upload File Stock",
                  "Upload File Delivery",
                  "Upload File Minimum Stock",
                ].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(opt)}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Table === */}
      <div className="mt-4 mb-4">
        <div className="bg-white table-container-rounded">
          <div className="table-responsive">
            <table className="table table-bordered table-sm text-center table-custom">
              <thead>
                <tr className="bg-abu">
                  <th style={{ width: "300px" }}>Warehouse</th>
                  <th>
                    Total Stock ONT Entherprise
                    <br />
                    <small>(A)</small>
                  </th>
                  <th>
                    GAP Stock
                    <br />
                    <small>(A + C - B)</small>
                  </th>
                  <th>
                    Kebutuhan
                    <br />
                    <small></small>
                  </th>
                  <th>
                    Minimum Stock
                    <br />
                    Requirement Retail
                    <br />
                    <small>(B)</small>
                  </th>
                  <th>
                    On Delivery
                    <br />
                    <small>(C)</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center">Memuat...</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan="6" className="text-danger text-center">{error}</td>
                  </tr>
                )}
                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">Tidak ada data</td>
                  </tr>
                )}
                {!loading && !error && rows.map((r, idx) => (
                  <tr key={r.warehouse || idx}>
                    <td className="bg-abu">{r.warehouse}</td>
                    <td>{r.total_stock_a}</td>
                    <td className={(r.gap_stock < 0 ? "bg-danger" : r.gap_stock < defaultYellowThreshold ? "bg-warning" : "bg-success") + " text-white fw-bold"}>{r.gap_stock}</td>
                    <td>{r.kebutuhan}</td>
                    <td>{r.min_stock_requirement_b}</td>
                    <td>{r.on_delivery_c}</td>
                  </tr>
                ))}
                {!loading && !error && rows.length > 0 && (
                  <tr className="fw-bold">
                    <td className="bg-abu">Total</td>
                    <td className="bg-abu">{rows.reduce((a, b) => a + (Number(b.total_stock_a)||0), 0)}</td>
                    <td className="bg-abu">{rows.reduce((a, b) => a + (Number(b.gap_stock)||0), 0)}</td>
                    <td className="bg-abu">{rows.reduce((a, b) => a + (Number(b.kebutuhan)||0), 0)}</td>
                    <td className="bg-abu">{rows.reduce((a, b) => a + (Number(b.min_stock_requirement_b)||0), 0)}</td>
                    <td className="bg-abu">{rows.reduce((a, b) => a + (Number(b.on_delivery_c)||0), 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
