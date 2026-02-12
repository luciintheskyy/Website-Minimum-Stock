import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function RekapMinitokAP() {
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [counts, setCounts] = useState({ red: 0, yellow: 0, green: 0 });
  const [rows, setRows] = useState([]);
  const uploadInputRef = useRef(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [taOptions, setTaOptions] = useState([]);
  const [taLoading, setTaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTreg, setSelectedTreg] = useState(null);

  // Default parameter global sesuai dokumentasi
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
            jenis: "AP",
            min_stock: defaultMinStock,
            kebutuhan: defaultKebutuhan,
            yellow_threshold: defaultYellowThreshold,
          },
        });
        const data = res.data || {};
        const lu = data.last_update || null;
        if (lu) {
          const date = new Date(lu);
          const formattedDate = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(
            2,
            "0"
          )} ${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
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
        setError("Gagal memuat ringkasan AP");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [API_BASE_URL, reloadToken]);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
    if (type === "taccan") {
      const candidatesSet = new Set();
      if (selectedTreg) {
        const n = String(selectedTreg).replace(/\D/g, "");
        if (n) candidatesSet.add(`WH TR TREG ${n}`);
      }
      (rows || []).forEach((r) => {
        const w = String(r.warehouse || "");
        const m = w.match(/WH TR TREG \d+/i);
        if (m) candidatesSet.add(m[0]);
      });
      let candidates = Array.from(candidatesSet);
      if (candidates.length === 0) {
        candidates = [1, 2, 3, 4, 5, 6, 7].map((n) => `WH TR TREG ${n}`);
      }
      (async () => {
        setTaLoading(true);
        try {
          const lists = await Promise.all(
            candidates.map(async (wh) => {
              try {
                const res = await axios.get(
                  `${API_BASE_URL}/api/warehouses/ta-ccan`,
                  { params: { warehouse: wh } }
                );
                return res.data?.data || [];
              } catch (e) {
                try {
                  const res2 = await axios.get(
                    `${API_BASE_URL}/api/warehouses/${encodeURIComponent(
                      wh
                    )}/ta-ccan`
                  );
                  return res2.data?.data || [];
                } catch (_) {
                  return [];
                }
              }
            })
          );
          const flat = [].concat(...lists);
          const seen = new Set();
          const uniq = [];
          flat.forEach((item) => {
            const key = item?.label || item?.value || String(item);
            if (!seen.has(key)) {
              seen.add(key);
              uniq.push(item);
            }
          });
          setTaOptions(uniq);
        } finally {
          setTaLoading(false);
        }
      })();
    }
  };

  const handleOptionSelect = (option) => {
    setActiveDropdown(null);
    if (option === "Export Data" || option === "Export All Data") {
      exportXLSX();
    } else if (
      option === "Upload File Stock" ||
      option === "Upload File Delivery" ||
      option === "Upload File Minimum Stock"
    ) {
      openUpload();
    }
  };

  const exportXLSX = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports`, {
        params: { jenis: "AP", per_page: 200, page: 1 },
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
      const aoa = [headers, ...all.map((r) => headers.map((h) => r[h] ?? ""))];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      XLSX.utils.book_append_sheet(wb, ws, `Report_AP`);
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_report_AP.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Gagal export data");
    }
  };

  const openUpload = () => uploadInputRef.current?.click();
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const toStr = (v) => (v == null ? "" : String(v));
      const toDateStr = (v) => {
        if (!v) return "";
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        if (typeof v === "number") {
          const p = XLSX.SSF.parse_date_code(v);
          if (!p) return String(v);
          const yyyy = String(p.y).padStart(4, "0");
          const mm = String(p.m).padStart(2, "0");
          const dd = String(p.d).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        }
        if (typeof v === "string") return v.length >= 10 ? v.slice(0, 10) : v;
        return "";
      };
      const items = rows.map((row) => ({
        type: toStr(row.type),
        qty: parseInt(row.qty || "0", 10),
        warehouse: toStr(row.warehouse),
        sender_alamat: toStr(row.sender_alamat),
        sender_pic: toStr(row.sender_pic),
        receiver_alamat: toStr(row.receiver_alamat),
        receiver_warehouse: toStr(row.receiver_warehouse),
        receiver_pic: toStr(row.receiver_pic),
        tanggal_pengiriman: toDateStr(row.tanggal_pengiriman),
        tanggal_sampai: toDateStr(row.tanggal_sampai),
        batch: toStr(row.batch),
      }));
      const resConfirm = await Swal.fire({
        title: "Konfirmasi import",
        text: `Import ${items.length} item?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, import",
        cancelButtonText: "Batal",
      });
      if (!resConfirm.isConfirmed) return;
      await axios.post(`${API_BASE_URL}/api/reports`, { jenis: "AP", items });
      toast.success(`Import berhasil: ${items.length} item`);
      setReloadToken((t) => t + 1);
    } catch (err) {
      console.error(err);
      toast.error("Gagal import data");
    } finally {
      e.target.value = "";
    }
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
      <div className="row g-3 py-3 rekap-cards">
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
      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-2 rekap-actions">
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* TREG */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("treg")}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn btn-standard"
              style={{
                backgroundColor: "#EEF2F6",
                width: "80px",
                outline: "none",
                transition: "boder-color, box-shadow 0.15s ease-in-out",
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
                <button
                  onClick={() => {
                    setSelectedTreg(null);
                    setActiveDropdown(null);
                  }}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Semua
                </button>
                {(() => {
                  const s = new Set();
                  (rows || []).forEach((r) => {
                    const m = String(r.warehouse || "").match(/TREG\s*\d+/gi);
                    if (m)
                      m.forEach((mm) =>
                        s.add(`TREG ${String(mm).replace(/[^0-9]/g, "")}`)
                      );
                  });
                  return Array.from(s).sort(
                    (a, b) =>
                      parseInt(a.replace(/\D/g, ""), 10) -
                      parseInt(b.replace(/\D/g, ""), 10)
                  );
                })().map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedTreg(opt);
                      setActiveDropdown(null);
                    }}
                    className="dropdown-item text-start px-3 py-2 small"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TA CCAN */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("taccan")}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn btn-standard"
              style={{
                backgroundColor: "#EEF2F6",
                width: "106px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
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
                {taLoading ? (
                  <div className="px-3 py-2 small text-muted">Loading...</div>
                ) : taOptions.length > 0 ? (
                  taOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        handleOptionSelect(
                          opt.label || opt.value || String(opt)
                        )
                      }
                      className="dropdown-item text-start px-3 py-2 small"
                    >
                      {opt.label || opt.value || String(opt)}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 small text-muted">No options</div>
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="position-relative">
            <button
              onClick={() => toggleDropdown("export")}
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn btn-standard"
              style={{
                backgroundColor: "#EEF2F6",
                width: "155px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/TrayArrowUp.svg"
                  alt="Export"
                  style={{ width: "20px", height: "20px" }}
                />
                Export Data
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
              className="btn d-flex align-items-center justify-content-between px-2 text-dark custom-btn btn-standard"
              style={{
                backgroundColor: "#EEF2F6",
                width: "160px",
                outline: "none",
                transition:
                  "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
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

      <input
        ref={uploadInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* === Table === */}
      <div className="rekap-table">
        <div className="bg-white table-container-rounded">
          <div className="table-responsive">
            <table className="table table-bordered table-sm text-center table-custom">
              <thead>
                <tr className="bg-abu">
                  <th style={{ width: "300px" }}>Warehouse</th>
                  <th>
                    Total Stock AP
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
                    <td colSpan="6" className="text-center">
                      Memuat...
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan="6" className="text-danger text-center">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Tidak ada data
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  (() => {
                    const q = searchTerm.trim().toLowerCase();
                    const bySearch = (x) =>
                      [
                        x.warehouse,
                        x.total_stock_a,
                        x.gap_stock,
                        x.kebutuhan,
                        x.min_stock_requirement_b,
                        x.on_delivery_c,
                      ].some((v) =>
                        String(v || "")
                          .toLowerCase()
                          .includes(q)
                      );
                    const byTreg = (x) => {
                      if (!selectedTreg) return true;
                      return String(x.warehouse || "")
                        .toLowerCase()
                        .includes(String(selectedTreg).toLowerCase());
                    };
                    return rows.filter((x) => bySearch(x) && byTreg(x));
                  })().map((r, idx) => (
                    <tr key={r.warehouse || idx}>
                      <td className="bg-abu">{r.warehouse}</td>
                      <td>{r.total_stock_a}</td>
                      <td
                        className={
                          (r.gap_stock < 0
                            ? "bg-danger"
                            : r.gap_stock < defaultYellowThreshold
                            ? "bg-warning"
                            : "bg-success") + " text-white fw-bold"
                        }
                      >
                        {r.gap_stock}
                      </td>
                      <td>{r.kebutuhan}</td>
                      <td>{r.min_stock_requirement_b}</td>
                      <td>{r.on_delivery_c}</td>
                    </tr>
                  ))}
                {!loading &&
                  !error &&
                  (() => {
                    const q = searchTerm.trim().toLowerCase();
                    const bySearch = (x) =>
                      [
                        x.warehouse,
                        x.total_stock_a,
                        x.gap_stock,
                        x.kebutuhan,
                        x.min_stock_requirement_b,
                        x.on_delivery_c,
                      ].some((v) =>
                        String(v || "")
                          .toLowerCase()
                          .includes(q)
                      );
                    const byTreg = (x) => {
                      if (!selectedTreg) return true;
                      return String(x.warehouse || "")
                        .toLowerCase()
                        .includes(String(selectedTreg).toLowerCase());
                    };
                    return (
                      rows.filter((x) => bySearch(x) && byTreg(x)).length > 0
                    );
                  })() && (
                    <tr className="fw-bold">
                      <td className="bg-abu">Total</td>
                      <td className="bg-abu">
                        {rows
                          .filter((x) => {
                            const q = searchTerm.trim().toLowerCase();
                            const bySearch = [
                              x.warehouse,
                              x.total_stock_a,
                              x.gap_stock,
                              x.kebutuhan,
                              x.min_stock_requirement_b,
                              x.on_delivery_c,
                            ].some((v) =>
                              String(v || "")
                                .toLowerCase()
                                .includes(q)
                            );
                            const byTreg =
                              !selectedTreg ||
                              String(x.warehouse || "")
                                .toLowerCase()
                                .includes(String(selectedTreg).toLowerCase());
                            return bySearch && byTreg;
                          })
                          .reduce(
                            (a, b) => a + (Number(b.total_stock_a) || 0),
                            0
                          )}
                      </td>
                      <td className="bg-abu">
                        {rows
                          .filter((x) => {
                            const q = searchTerm.trim().toLowerCase();
                            const bySearch = [
                              x.warehouse,
                              x.total_stock_a,
                              x.gap_stock,
                              x.kebutuhan,
                              x.min_stock_requirement_b,
                              x.on_delivery_c,
                            ].some((v) =>
                              String(v || "")
                                .toLowerCase()
                                .includes(q)
                            );
                            const byTreg =
                              !selectedTreg ||
                              String(x.warehouse || "")
                                .toLowerCase()
                                .includes(String(selectedTreg).toLowerCase());
                            return bySearch && byTreg;
                          })
                          .reduce((a, b) => a + (Number(b.gap_stock) || 0), 0)}
                      </td>
                      <td className="bg-abu">
                        {rows
                          .filter((x) => {
                            const q = searchTerm.trim().toLowerCase();
                            const bySearch = [
                              x.warehouse,
                              x.total_stock_a,
                              x.gap_stock,
                              x.kebutuhan,
                              x.min_stock_requirement_b,
                              x.on_delivery_c,
                            ].some((v) =>
                              String(v || "")
                                .toLowerCase()
                                .includes(q)
                            );
                            const byTreg =
                              !selectedTreg ||
                              String(x.warehouse || "")
                                .toLowerCase()
                                .includes(String(selectedTreg).toLowerCase());
                            return bySearch && byTreg;
                          })
                          .reduce((a, b) => a + (Number(b.kebutuhan) || 0), 0)}
                      </td>
                      <td className="bg-abu">
                        {rows
                          .filter((x) => {
                            const q = searchTerm.trim().toLowerCase();
                            const bySearch = [
                              x.warehouse,
                              x.total_stock_a,
                              x.gap_stock,
                              x.kebutuhan,
                              x.min_stock_requirement_b,
                              x.on_delivery_c,
                            ].some((v) =>
                              String(v || "")
                                .toLowerCase()
                                .includes(q)
                            );
                            const byTreg =
                              !selectedTreg ||
                              String(x.warehouse || "")
                                .toLowerCase()
                                .includes(String(selectedTreg).toLowerCase());
                            return bySearch && byTreg;
                          })
                          .reduce(
                            (a, b) =>
                              a + (Number(b.min_stock_requirement_b) || 0),
                            0
                          )}
                      </td>
                      <td className="bg-abu">
                        {rows
                          .filter((x) => {
                            const q = searchTerm.trim().toLowerCase();
                            const bySearch = [
                              x.warehouse,
                              x.total_stock_a,
                              x.gap_stock,
                              x.kebutuhan,
                              x.min_stock_requirement_b,
                              x.on_delivery_c,
                            ].some((v) =>
                              String(v || "")
                                .toLowerCase()
                                .includes(q)
                            );
                            const byTreg =
                              !selectedTreg ||
                              String(x.warehouse || "")
                                .toLowerCase()
                                .includes(String(selectedTreg).toLowerCase());
                            return bySearch && byTreg;
                          })
                          .reduce(
                            (a, b) => a + (Number(b.on_delivery_c) || 0),
                            0
                          )}
                      </td>
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
