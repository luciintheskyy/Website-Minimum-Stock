import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Tooltip } from "bootstrap";
import { postActivityLog } from "../api/activityLogs";

export default function ReportMinitokNodeB() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const [totalData, setTotalData] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const uploadInputRef = useRef(null);

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

  const jenis = "NodeB";

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reports`, {
          params: { jenis, per_page: entriesPerPage, page: currentPage },
        });
        const data = res.data?.data || [];
        const meta = res.data?.meta || {};
        setReports(data);
        setTotalData(meta.total ?? data.length);
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data report");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [API_BASE_URL, entriesPerPage, currentPage]);

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRange = Math.min(currentPage * entriesPerPage, totalData);

  const downloadTemplateCSV = () => {
    const headers = [
      "type",
      "qty",
      "warehouse",
      "sender_alamat",
      "sender_pic",
      "receiver_alamat",
      "receiver_warehouse",
      "receiver_pic",
      "tanggal_pengiriman",
      "tanggal_sampai",
      "batch",
    ];
    const csv = headers.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_report_${jenis}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    try {
      postActivityLog({
        user_id: Number(localStorage.getItem("current_user_id")) || undefined,
        activity: "download template report NodeB",
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
  };

  const exportCSV = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports`, {
        params: { jenis, per_page: 200, page: 1 },
      });
      const all = res.data?.data || [];
      const headers = [
        "id",
        "jenis",
        "type",
        "qty",
        "warehouse",
        "sender_alamat",
        "sender_pic",
        "receiver_alamat",
        "receiver_warehouse",
        "receiver_pic",
        "tanggal_pengiriman",
        "tanggal_sampai",
        "batch",
        "created_at",
        "updated_at",
      ];
      const rows = all.map((r) => headers.map((h) => (r[h] ?? "")).join(","));
      const csv = headers.join(",") + "\n" + rows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_report_${jenis}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      try {
        postActivityLog({
          user_id: Number(localStorage.getItem("current_user_id")) || undefined,
          activity: "export data report NodeB",
          timestamp: new Date().toISOString(),
        });
      } catch (_) {}
    } catch (e) {
      console.error(e);
      alert("Gagal export data");
    }
  };

  const openUpload = () => uploadInputRef.current?.click();
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    try {
      if (isCSV) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
        const headers = lines.shift().split(",");
        const items = lines.map((line) => {
          const cols = line.split(",");
          const obj = {};
          headers.forEach((h, i) => (obj[h].trim ? obj[h.trim()] = (cols[i] || "").trim() : null));
          obj.qty = parseInt(obj.qty || "0", 10);
          obj.warehouse = obj.warehouse || null;
          obj.sender_alamat = obj.sender_alamat || null;
          obj.sender_pic = obj.sender_pic || null;
          obj.receiver_alamat = obj.receiver_alamat || null;
          obj.receiver_warehouse = obj.receiver_warehouse || null;
          obj.receiver_pic = obj.receiver_pic || null;
          obj.tanggal_pengiriman = obj.tanggal_pengiriman || null;
          obj.tanggal_sampai = obj.tanggal_sampai || null;
          obj.batch = obj.batch || null;
          return obj;
        });
        await axios.post(`${API_BASE_URL}/api/reports`, { jenis, items });
        alert(`Import berhasil: ${items.length} item`);
        try {
          postActivityLog({
            user_id: Number(localStorage.getItem("current_user_id")) || undefined,
            activity: `import laporan NodeB (${items.length} item)`,
            timestamp: new Date().toISOString(),
          });
        } catch (_) {}
      } else {
        alert("Format tidak didukung. Gunakan CSV untuk saat ini.");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal import data");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <>
      {/* Search Bar dan Action Buttons */}
      <div
        className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2"
        ref={dropdownContainerRef}
      >
        <input
          type="text"
          placeholder="Search..."
          className="form-control"
          style={{ width: "300px" }}
        />

        <div className="d-flex align-items-center gap-2 flex-nowrap ms-auto">
          {/* Batch Dropdown */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("batch")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "90px",
                height: "38px",
                border: "none",
              }}
            >
              <span>Batch</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "batch" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                <button
                  onClick={() => handleOptionSelect("Batch 1")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Batch 1
                </button>
                <button
                  onClick={() => handleOptionSelect("Batch 2")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Batch 2
                </button>
              </div>
            )}
          </div>

          {/* TREG Dropdown */}
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
                {[
                  "TREG 1",
                  "TREG 2",
                  "TREG 3",
                  "TREG 4",
                  "TREG 5",
                  "TREG 6",
                  "TREG 7",
                ].map((treg) => (
                  <button
                    key={treg}
                    onClick={() => handleOptionSelect(treg)}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    {treg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
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
                <button
                  onClick={() => handleOptionSelect("Export Data")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Export All SN
                </button>
                <button
                  onClick={() => handleOptionSelect("Export All Data")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Export Data
                </button>
              </div>
            )}
          </div>

          {/* Download Template */}
          <button onClick={downloadTemplateCSV}
            className="btn d-flex align-items-center justify-content-between px-3 text-dark"
            style={{
              backgroundColor: "#EEF2F6",
              width: "205px",
              height: "38px",
              border: "none",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src="/assets/Download.svg"
                alt="Export"
                style={{ width: "20px", height: "20px" }}
              />
              Download Template
            </div>
          </button>

          {/* Upload Pengiriman */}
          <input ref={uploadInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileSelected} />
          <button onClick={openUpload}
            className="btn d-flex align-items-center justify-content-between px-3 text-dark"
            style={{
              backgroundColor: "#EEF2F6",
              width: "200px",
              height: "38px",
              border: "none",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src="/assets/UploadSimple.svg"
                alt="Export"
                style={{ width: "20px", height: "20px" }}
              />
              Upload Pengiriman
            </div>
          </button>
        </div>
      </div>

      {/* === Table === */}
      <div className="mt-4 mb-4">
        <div className="bg-white table-container-rounded">
          <div className="table-responsive">
            <table className="table table-bordered table-sm text-center align-middle">
              <thead className="bg-abu">
                <tr>
                  <th
                    rowSpan="2"
                    style={{ width: "50px", verticalAlign: "middle" }}
                  >
                    No
                  </th>
                  <th
                    rowSpan="2"
                    style={{ width: "200px", verticalAlign: "middle" }}
                  >
                    Type
                  </th>
                  <th
                    rowSpan="2"
                    style={{ width: "80px", verticalAlign: "middle" }}
                  >
                    Qty
                  </th>
                  <th colSpan="2">Pengirim</th>
                  <th colSpan="3">Penerima</th>
                  <th
                    rowSpan="2"
                    style={{ width: "150px", verticalAlign: "middle" }}
                  >
                    Tanggal Pengiriman
                  </th>
                  <th
                    rowSpan="2"
                    style={{ width: "150px", verticalAlign: "middle" }}
                  >
                    Tanggal Sampai
                  </th>
                  <th
                    rowSpan="2"
                    style={{ width: "100px", verticalAlign: "middle" }}
                  >
                    Batch
                  </th>
                  <th
                    rowSpan="2"
                    style={{ width: "100px", verticalAlign: "middle" }}
                  >
                    Action
                  </th>
                </tr>
                <tr>
                  <th>Alamat</th>
                  <th>PIC</th>
                  <th>Alamat</th>
                  <th>Warehouse</th>
                  <th>PIC</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={12} className="text-center">Memuat...</td></tr>
                )}
                {error && !loading && (
                  <tr><td colSpan={12} className="text-center text-danger">{error}</td></tr>
                )}
                {!loading && !error && reports.length === 0 && (
                  <tr><td colSpan={12} className="text-center">Tidak ada data</td></tr>
                )}
                {!loading && !error && reports.map((r, idx) => (
                  <tr key={r.id || idx}>
                    <td>{(currentPage - 1) * entriesPerPage + idx + 1}</td>
                    <td>{r.type}</td>
                    <td>{r.qty}</td>
                    <td>{r.sender_alamat || '-'}</td>
                    <td>{r.sender_pic || '-'}</td>
                    <td>{r.receiver_alamat || '-'}</td>
                    <td>{r.receiver_warehouse || '-'}</td>
                    <td>{r.receiver_pic || '-'}</td>
                    <td>{r.tanggal_pengiriman || '-'}</td>
                    <td>{r.tanggal_sampai || '-'}</td>
                    <td>{r.batch || '-'}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button className="btn btn-sm p-1" style={{ backgroundColor: "transparent", border: "none" }} onClick={exportCSV}>
                          <img src="/assets/TrayArrowUp.svg" alt="Export" style={{ width: "20px", height: "20px" }} />
                        </button>
                        <button className="btn btn-sm p-1" style={{ backgroundColor: "transparent", border: "none" }}>
                          <img src="/assets/Trash.svg" alt="Delete" style={{ width: "20px", height: "20px" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center px-3 py-2">
            <div>
              <select
                className="form-select form-select-sm"
                style={{ width: "110px" }}
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 entries</option>
                <option value={25}>25 entries</option>
                <option value={50}>50 entries</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E3E8EF",
                  color: "#6c757d",
                }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                &lt;
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className="btn btn-sm"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E3E8EF",
                    fontWeight: page === currentPage ? "600" : "400",
                  }}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-sm"
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E3E8EF",
                  color: "#6c757d",
                }}
                disabled={currentPage * entriesPerPage >= totalData}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                &gt;
              </button>
            </div>

            <div
              className="small d-flex align-items-center justify-content-center"
              style={{
                minWidth: "60px",
                height: "32px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E3E8EF",
                borderRadius: "6px",
                color: "#6c757d",
              }}
            >
              {endRange}-{totalData}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
