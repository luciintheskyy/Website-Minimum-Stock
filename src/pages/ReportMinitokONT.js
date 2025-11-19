import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { postActivityLog } from "../api/activityLogs";

export default function ReportMinitokONT() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const [totalData, setTotalData] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const uploadInputRef = useRef(null);
  const [selectedTregs, setSelectedTregs] = useState([
    "TREG 1",
    "TREG 2",
    "TREG 3",
    "TREG 4",
    "TREG 5",
  ]);

  const jenis = "ONT";

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
      const userId = parseInt(localStorage.getItem("user_id"), 10);
      if (userId) {
        postActivityLog({
          user_id: userId,
          activity: `Download template laporan ${jenis}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      // ignore logging error
      console.error("Gagal mencatat log download template", e);
    }
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
        const userId = parseInt(localStorage.getItem("user_id"), 10);
        if (userId) {
          await postActivityLog({
            user_id: userId,
            activity: `Export data report ${jenis}`,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (logErr) {
        console.error("Gagal mencatat log export", logErr);
      }
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
          headers.forEach((h, i) => (obj[h.trim()] = (cols[i] || "").trim()));
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
        try {
          const userId = parseInt(localStorage.getItem("user_id"), 10);
          if (userId) {
            await postActivityLog({
              user_id: userId,
              activity: `Import laporan ${jenis} (${items.length} item)`,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (logErr) {
          console.error("Gagal mencatat log import", logErr);
        }
        alert(`Import berhasil: ${items.length} item`);
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

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleTregCheckboxToggle = (tregOption) => {
    setSelectedTregs((prev) => {
      const isSelected = prev.includes(tregOption);
      let newSelected;
      if (isSelected) {
        newSelected = prev.filter((item) => item !== tregOption); // Uncheck
      } else {
        newSelected = [...prev, tregOption]; // Check
      }
      // Sort urutan TREG terkecil ke terbesar (1,2,3,4,5,6,7)
      newSelected.sort(
        (a, b) =>
          parseInt(a.replace("TREG ", "")) - parseInt(b.replace("TREG ", ""))
      );
      return newSelected;
    });
    console.log("TREG toggled:", tregOption, "Dropdown remains open");
  };

  const handleOptionSelect = (option) => {
    console.log("Selected:", option);
    setActiveDropdown(null); // Tutup dropdown
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log(
        "Click outside detected on:",
        event.target.tagName,
        event.target.className
      ); // Debug: Lihat elemen yang diklik (hapus setelah test)
      const isClickOnDropdownItem = event.target.closest(".dropdown-item");
      const isClickOnTrigger = false; // Cek jika klik trigger active (manual check)
      // FIX: Tutup jika klik di luar ref ATAU klik di dalam ref tapi bukan dropdown-item dan bukan trigger active
      if (
        !dropdownContainerRef.current.contains(event.target) || // Luar seluruh bar
        (dropdownContainerRef.current.contains(event.target) && // Dalam bar
          !isClickOnDropdownItem && // Bukan opsi dropdown
          !isClickOnTrigger) // Bukan trigger button active
      ) {
        console.log("Closing dropdown (outside or other button)"); // Debug
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]); // FIX: Tambah dependency activeDropdown agar re-run jika ganti

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRange = Math.min(currentPage * entriesPerPage, totalData);

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
          className={`form-control ${isSearchFocused ? "search-focused" : ""}`} // Dari perbaikan sebelumnya (untuk border merah)
          style={{
            width: "300px",
            transition:
              "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
          }}
          onFocus={(e) => {
            // FIX: Tambah param (e) untuk akses e.stopPropagation()
            setIsSearchFocused(true); // State untuk border merah
            setActiveDropdown(null); // TUTUP SEMUA DROPDOWN OTOMATIS
            e.stopPropagation(); // Cegah bubble ke handleClickOutside
            console.log("Search focused: Dropdown closed"); // Test: Cek console
          }}
          onBlur={() => {
            setIsSearchFocused(false); // Reset border
            console.log("Search blurred"); // Test
          }}
          // Opsional: Tambah onChange jika ada logic search (misal filter tabel)
          // onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="d-flex align-items-center gap-2 flex-nowrap ms-auto order-3">
          {/* Dropdown Batch (sama seperti kode Anda, simple – sekarang pakai handleOptionSelect) */}
          <div className="position-relative me-2 batch-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("batch");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "80px",
                height: "38px",
                border: "none",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "none";
                e.target.style.boxShadow = "none";
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
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3"
                style={{
                  minWidth: "172px", // TAMBAHAN: Lebar minimal 250px (cukup untuk opsi panjang)
                  width: "auto", // Auto-adjust jika konten lebih lebar
                  left: 0, // Align kanan agar tidak overlap button kiri
                }}
              >
                {[
                  "3400 RETAIL HUAWEI",
                  "4817 RETAIL HUAWEI",
                  "NODE B ZTE SEPTEMBER",
                  "NODE B 550 FH",
                  "RETAIL 12786",
                  "RETAIL 12786, TUF",
                  "RETAIL ST KE CPP",
                  "SENDIRI",
                  "ST KE CPP",
                ].map((option, i) => (
                  <button
                    key={i}
                    className="dropdown-item text-start px-2 py-2 small custom-hover"
                    style={{
                      cursor: "pointer",
                      transition:
                        "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      width: "100%",
                      textAlign: "left",
                      whiteSpace: "nowrap", // TAMBAHAN: No wrap
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // FIX: Cegah bubble ke document
                      handleOptionSelect(option); // FIX: Syntax benar (no koma kosong, no e/type)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#CB3A31"; // Hover teks merah
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = ""; // Reset
                      e.currentTarget.style.backgroundColor = "";
                    }}
                    title={option} // TAMBAHAN: Tooltip full text
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TREG Dropdown */}
          <div className="position-relative me-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("treg");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "80px",
                height: "38px",
                border: "none",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
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
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3"
                style={{
                  minWidth: "84px", // TAMBAHAN: Lebar minimal 250px (cukup untuk opsi panjang)
                  width: "auto", // Auto-adjust jika konten lebih lebar
                  left: 0, // Align kanan agar tidak overlap button kiri
                }}
              >
                {["1", "2", "3", "4", "5"].map((num) => {
                  const tregOption = `TREG ${num}`;
                  const isChecked = selectedTregs.includes(tregOption);
                  return (
                    <div
                      key={num}
                      className="dropdown-item px-2 py-2 small d-flex align-items-center custom-hover"
                      style={{
                        cursor: "pointer",
                        transition:
                          "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#CB3A31";
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "";
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`treg-${num}`}
                        checked={isChecked}
                        onChange={(e) => {
                          // FIX: Tambah param (e) – hilangkan error 'e' undefined
                          e.stopPropagation(); // Sekarang e defined
                          handleTregCheckboxToggle(tregOption);
                        }}
                        className="me-2 custom-checkbox"
                        style={{
                          cursor: "pointer",
                          accentColor: "#CB3A31", // Checkbox merah seperti acuan
                        }}
                      />
                      <label
                        htmlFor={`treg-${num}`}
                        className="mb-0 w-100"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "#CB3A31";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "";
                        }}
                      >
                        TREG {num}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="position-relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown("export");
              }}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn"
              style={{
                backgroundColor: "#EEF2F6",
                width: "114px",
                height: "38px",
                border: "none",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #CB3A31";
                e.target.style.boxShadow =
                  "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid #dee2e6";
                e.target.style.boxShadow = "none";
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
              <div
                className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3"
                style={{
                  minWidth: "114px", // TAMBAHAN: Lebar minimal 250px (cukup untuk opsi panjang)
                  width: "auto", // Auto-adjust jika konten lebih lebar
                }}
              >
                {["Export Data", "Export All SN"].map((label, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      exportCSV();
                    }}
                    className="dropdown-item text-start px-2 py-2 small custom-hover"
                    style={{
                      cursor: "pointer",
                      transition:
                        "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
                      width: "100%",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#CB3A31"; // Hover teks merah
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = ""; // Reset
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Template */}
          <button onClick={downloadTemplateCSV}
            className="btn d-flex align-items-center justify-content-between px-2 text-dark"
            style={{
              backgroundColor: "#EEF2F6",
              width: "188px",
              height: "38px",
              border: "none",
              border: "none",
              outline: "none",
              transition:
                "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #CB3A31";
              e.target.style.boxShadow = "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #dee2e6";
              e.target.style.boxShadow = "none";
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src="/assets/Download.svg"
                alt="Download"
                style={{ width: "20px", height: "20px" }}
              />
              Download Template
            </div>
          </button>

          {/* Upload Pengiriman */}
          <input ref={uploadInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileSelected} />
          <button onClick={openUpload}
            className="btn d-flex align-items-center justify-content-between px-2 text-dark"
            style={{
              backgroundColor: "#EEF2F6",
              width: "182px",
              height: "38px",
              border: "none",
              border: "none",
              outline: "none",
              transition:
                "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #CB3A31";
              e.target.style.boxShadow = "0 0 0 0.2rem rgba(203, 58, 49, 0.25)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #dee2e6";
              e.target.style.boxShadow = "none";
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src="/assets/UploadSimple.svg"
                alt="Upload"
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
                        <button className="btn btn-sm p-1" style={{ backgroundColor: "transparent", border: "none" }}>
                          <img src="/assets/NotePencil.svg" alt="Edit" style={{ width: "20px", height: "20px" }} />
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
          <div className="d-flex justify-content-between align-items-center px-2 py-2">
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
