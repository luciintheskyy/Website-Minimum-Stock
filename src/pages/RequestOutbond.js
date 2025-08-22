import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function RequestOutbound() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalData = 5;

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

  const rows = [
    {
      type: "ONT_FIBERHOME_HG6245N",
      jenis: "Premium",
      merk: "Fiberhome",
      qty: 10,
      delivery: "Udara",
      tujuan: "TA WITEL CCAN LAMPUNG (BANDAR LAMPUNG) WH",
      pic: "Admin",
      approvedBy: "Admin",
      time: "2023-11-27 10:43:53",
      status: "On Going",
    },
    {
      type: "STB_ZTE_B860H_V5.0",
      jenis: "STB",
      merk: "ZTE",
      qty: 5,
      delivery: "Darat",
      tujuan: "TA WITEL JAKARTA SELATAN",
      pic: "Rina",
      approvedBy: "Andi",
      time: "2023-11-28 09:12:15",
      status: "Submitted",
    },
    {
      type: "ONT_HUAWEI_HG8245H",
      jenis: "Basic",
      merk: "Huawei",
      qty: 15,
      delivery: "Udara",
      tujuan: "TA WITEL BANDUNG",
      pic: "Admin",
      approvedBy: "Admin",
      time: "2023-11-29 11:20:33",
      status: "On Going",
    },
    {
      type: "ONT_ZTE_F660",
      jenis: "Premium",
      merk: "ZTE",
      qty: 8,
      delivery: "Darat",
      tujuan: "TA WITEL SURABAYA",
      pic: "Budi",
      approvedBy: "Siti",
      time: "2023-11-30 14:45:27",
      status: "Approved",
    },
    {
      type: "ONT_FIBERHOME_AN5506-04-FG",
      jenis: "Basic",
      merk: "Fiberhome",
      qty: 12,
      delivery: "Udara",
      tujuan: "TA WITEL MEDAN",
      pic: "Agus",
      approvedBy: "Tono",
      time: "2023-12-01 08:32:40",
      status: "Approved",
    },
  ];

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
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.type}</td>
                    <td>{row.jenis}</td>
                    <td>{row.merk}</td>
                    <td>{row.qty}</td>
                    <td>{row.delivery}</td>
                    <td>{row.tujuan}</td>
                    <td>{row.pic}</td>
                    <td>{row.approvedBy}</td>
                    <td>{row.time}</td>
                    <td>{renderStatus(row.status)}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm p-1"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                          }}
                        >
                          <img
                            src="/assets/ChatTeardropText.svg"
                            alt="Chat"
                            style={{ width: "20px", height: "20px" }}
                          />
                        </button>
                        <button
                          className="btn btn-sm p-1"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                          }}
                        >
                          <img
                            src="/assets/DotsThreeVertical.svg"
                            alt="More"
                            style={{ width: "20px", height: "20px" }}
                          />
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
              {[1].map((page) => (
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
