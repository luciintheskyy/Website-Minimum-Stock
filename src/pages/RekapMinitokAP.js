import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function RekapMinitokONT() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);

  useEffect(() => {
    const mockData = { last_update: "2025-07-12T09:59:30Z" };
    const date = new Date(mockData.last_update);
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(
      date.getSeconds()
    ).padStart(2, "0")}`;
    setLastUpdate(formattedDate);
  }, []);

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
      {/* Cards */}
      <div className="row g-3 py-3 mb-1">
        {/* Percentage */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Percentage</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">77,90%</div>
              <img
                src="/assets/ChartBar.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        {/* Red Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Red Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">53</div>
              <img
                src="/assets/CautionBell.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        {/* Yellow Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Yellow Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">159</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
        {/* Green Status */}
        <div className="col-md-3">
          <div className="border rounded bg-white px-3 py-3">
            <div className="text-muted medium mb-1">Green Status</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="h3 mb-0">349</div>
              <img
                src="/assets/WarningOctagon.svg"
                alt="Chart"
                style={{ width: "32px", height: "32px" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Last Update, Search Bar, Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mt-1 flex-wrap gap-2">
        <div
          className="rounded px-3 py-2 text-dark small"
          style={{ backgroundColor: "#EEF2F6" }}
        >
          Last Update : {lastUpdate}
        </div>

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
                <button
                  onClick={() => handleOptionSelect("TREG 1")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 1
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 2")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 2
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 3")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 3
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 4")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 4
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 5")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 5
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 6")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 6
                </button>
                <button
                  onClick={() => handleOptionSelect("TREG 7")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  TREG 7
                </button>
              </div>
            )}
          </div>

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
                <button
                  onClick={() => handleOptionSelect("CCAN A")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  CCAN A
                </button>
                <button
                  onClick={() => handleOptionSelect("CCAN B")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  CCAN B
                </button>
                <button
                  onClick={() => handleOptionSelect("CCAN C")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  CCAN C
                </button>
              </div>
            )}
          </div>

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
                  Export Data
                </button>
                <button
                  onClick={() => handleOptionSelect("Export All Data")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Export All Data
                </button>
              </div>
            )}
          </div>

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
                  alt="Export"
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
                <button
                  onClick={() => handleOptionSelect("Upload File Stock")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Upload File Stock
                </button>
                <button
                  onClick={() => handleOptionSelect("Upload File Delivery")}
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Upload File Delivery
                </button>
                <button
                  onClick={() =>
                    handleOptionSelect("Upload File Minimum Stock")
                  }
                  className="dropdown-item text-start px-3 py-2 small"
                >
                  Upload File Minimum Stock
                </button>
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
              <tr className="bg-abu">
                <th rowSpan="2" style={{ width: "300px" }}>
                  Warehouse
                </th>
                <th colSpan="4">
                  Stock SCMT
                  <br />
                  <small style={{ backgroundColor: "transparent" }}>(A)</small>
                </th>
                <th colSpan="2">
                  GAP Stock
                  <br />
                  <small style={{ backgroundColor: "transparent" }}>
                    (A + C - B)
                  </small>
                </th>
                <th colSpan="3">Kebutuhan</th>
                <th colSpan="3">
                  Minimum Stock Requirement Retail
                  <br />
                  <small style={{ backgroundColor: "transparent" }}>(B)</small>
                </th>
                <th colSpan="2">
                  On Delivery
                  <br />
                  <small style={{ backgroundColor: "transparent" }}>(C)</small>
                </th>
              </tr>
              <tr className="bg-abu">
                <th>Total Retail SB</th>
                <th>Total Retail DB</th>
                <th>Total Premium</th>
                <th>Total ONT</th>
                <th>Total Premium</th>
                <th>Total ONT</th>
                <th>Total Retail</th>
                <th>Total Premium</th>
                <th>Total ONT</th>
                <th>Total Retail</th>
                <th>Total Premium</th>
                <th>Total ONT</th>
                <th>Total Retail</th>
                <th>Total Premium</th>
              </tr>

              <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <tr key={i}>
                    {[
                      <td
                        key="warehouse"
                        className="bg-abu"
                      >{`WH TR TREG ${i}`}</td>,
                      <td key="sb">61</td>,
                      <td key="db">61</td>,
                      <td key="prem">23</td>,
                      <td key="ont">84</td>,
                      <td key="gap-prem">4</td>,
                      <td
                        key="gap-ont"
                        className="bg-success text-white fw-bold"
                      >
                        21
                      </td>,
                      <td key="k-retail">280</td>,
                      <td key="k-prem">156</td>,
                      <td key="k-ont">444</td>,
                      <td key="ms-retail">124</td>,
                      <td key="ms-prem">91</td>,
                      <td key="ms-ont">215</td>,
                      <td key="deliv-retail">80</td>,
                      <td key="deliv-prem">72</td>,
                    ]}
                  </tr>
                ))}

                {/* Total row */}
                <tr className="fw-bold">
                  {[
                    "Total",
                    61,
                    61,
                    23,
                    84,
                    4,
                    21,
                    280,
                    156,
                    444,
                    124,
                    91,
                    215,
                    80,
                    72,
                  ].map((val, idx) => (
                    <td key={idx} className="bg-abu">
                      {val}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
