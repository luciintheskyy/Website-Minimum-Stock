import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import axios from "axios";

export default function RequestOutbound() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [shipments, setShipments] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // (Chat removed per request)

  // === Date Range State ===
  const [range, setRange] = useState([
    {
      startDate: new Date(2025, 3, 1), // default 1 April 2025
      endDate: new Date(2025, 3, 30), // default 30 April 2025
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const toggleDropdown = (type) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  const handleOptionSelect = (option) => {
    console.log("Selected:", option);
    setActiveDropdown(null);
  };

  // klik di luar => tutup dropdown & calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch shipments from API when page/per_page changes
  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/shipments`, {
          params: { page: currentPage, per_page: entriesPerPage },
        });
        const payload = response?.data || {};
        setShipments(Array.isArray(payload.data) ? payload.data : []);
        const incomingMeta = payload.meta || {};
        setMeta({
          current_page: incomingMeta.current_page ?? currentPage,
          per_page: incomingMeta.per_page ?? entriesPerPage,
          total: incomingMeta.total ?? 0,
          last_page: incomingMeta.last_page ?? 1,
        });
      } catch (err) {
        setError(
          err?.response?.data?.message || "Gagal memuat data shipments"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [currentPage, entriesPerPage]);

  const totalData = meta.total || 0;
  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRange = Math.min(currentPage * entriesPerPage, totalData);

  // status badge style
  const renderStatus = (status) => {
    let style = {
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block",
    };

    if (status === "On Going") {
      style.backgroundColor = "#FEF3C7";
      style.color = "#F5C000";
    }
    if (status === "Submitted") {
      style.backgroundColor = "#DBEAFE";
      style.color = "#3B82F6";
    }
    if (status === "Approved") {
      style.backgroundColor = "#DCFCE7";
      style.color = "#22C55E";
    }

    return <span style={style}>{status}</span>;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return format(d, "yyyy-MM-dd HH:mm:ss");
  };

  // (Chat handlers removed per request)

  return (
    <>
      {/* Search Bar + Filters */}
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
          {/* Filters */}
          <div className="position-relative me-2">
            <button
              onClick={() => toggleDropdown("filters")}
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                width: "120px",
                height: "38px",
                border: "none",
              }}
            >
              <img
                src="/assets/Sliders.svg"
                alt="Sliders"
                className="me-2"
                style={{ width: "20px", height: "20px" }}
              />
              <span>Filters</span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>
            {activeDropdown === "filters" && (
              <div className="position-absolute bg-white border rounded shadow-sm mt-1 w-100 z-3">
                <button
                  onClick={() => handleOptionSelect("Filter 1")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Filter 1
                </button>
                <button
                  onClick={() => handleOptionSelect("Filter 2")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Filter 2
                </button>
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="position-relative" ref={calendarRef}>
            <button
              className="btn d-flex align-items-center justify-content-between px-3 text-dark"
              style={{
                backgroundColor: "#EEF2F6",
                minWidth: "230px",
                height: "38px",
                border: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => setShowCalendar((prev) => !prev)}
            >
              <img
                src="/assets/Calendar.svg"
                alt="Calendar"
                className="me-2"
                style={{ width: "20px", height: "20px" }}
              />
              <span style={{ flexGrow: 1, textAlign: "left" }}>
                {`${format(range[0].startDate, "MMM d, yyyy")} - ${format(
                  range[0].endDate,
                  "MMM d, yyyy"
                )}`}
              </span>
              <img
                src="/assets/CaretDownBold.svg"
                alt="Caret"
                className="ms-2"
                style={{ width: "16px", height: "16px" }}
              />
            </button>

            {showCalendar && (
              <div
                className="position-absolute mt-2 bg-white shadow rounded z-3"
                style={{ right: 0 }}
              >
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={range}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Table === */}
      <div className="mt-4 mb-4">
        <div className="bg-white table-container-rounded">
          <div className="table-responsive">
            <table className="table table-bordered table-sm text-center align-middle">
              <thead className="bg-abu">
                <tr>
                  <th>Type</th>
                  <th>Jenis</th>
                  <th>Merk</th>
                  <th>Qty</th>
                  <th>Delivery By</th>
                  <th>Alamat Tujuan</th>
                  <th>PIC</th>
                  <th>Approved By</th>
                  <th>Time Added</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={11} className="text-center">Memuat data...</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={11} className="text-center text-danger">{error}</td>
                  </tr>
                )}
                {!loading && !error && shipments.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center">Tidak ada data</td>
                  </tr>
                )}
                {!loading && !error && shipments.map((s) => (
                  <tr key={s.id}>
                    <td>{s.type}</td>
                    <td>{s.jenis}</td>
                    <td>{s.merk}</td>
                    <td>{s.qty}</td>
                    <td>{s.delivery_by}</td>
                    <td>{s.alamat_tujuan}</td>
                    <td>{s.pic?.name ?? "-"}</td>
                    <td>{s.approved_by?.name ?? "-"}</td>
                    <td>{formatDate(s.created_at)}</td>
                    <td>{renderStatus(s.status)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm p-1"
                          style={{ backgroundColor: "transparent", border: "none" }}
                        >
                          <img src="/assets/ChatTeardropText.svg" alt="Chat" style={{ width: "20px", height: "20px" }} />
                        </button>
                        <button
                          className="btn btn-sm p-1"
                          style={{ backgroundColor: "transparent", border: "none" }}
                        >
                          <img src="/assets/DotsThreeVertical.svg" alt="More" style={{ width: "20px", height: "20px" }} />
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
                <option value={15}>15 entries</option>
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
              {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((page) => (
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
                disabled={currentPage >= (meta.last_page || 1)}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.last_page || 1))}
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
      {/* Chat modal removed per request */}
    </>
  );
}
