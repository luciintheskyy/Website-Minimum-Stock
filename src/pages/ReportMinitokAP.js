import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Tooltip } from "bootstrap";

export default function ReportMinitokONT() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalData = 539;

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
          <button
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
          <button
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
                {[...Array(10)].map((_, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>ONT_FIBERHOME_HG6245N</td>
                    <td>24</td>
                    <td>WH FH</td>
                    <td>FIBERHOME</td>
                    <td>WH TA</td>
                    <td>TA WITEL CCAN BANGKA BELITUNG (PANGKAL PINANG) WH</td>
                    <td>WH TR TREG1</td>
                    <td>Tanggal Pengiriman</td>
                    <td>Tanggal Sampai</td>
                    <td>Batch</td>
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
                            src="/assets/NotePencil.svg"
                            alt="Edit"
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
                            src="/assets/Trash.svg"
                            alt="Delete"
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
