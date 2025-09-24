import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function RekapMinitokONT() {
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [selectedLevel, setSelectedLevel] = useState("treg"); // treg | witel | ta
  const [selectedWitel, setSelectedWitel] = useState(null);

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

  const tregData = {
    "WH TR TREG 1": [
      "WITEL ACEH",
      "WITEL LAMPUNG BENGKULU",
      "WITEL RIAU",
      "WITEL SUMBAGSEL",
      "WITEL SUMBAR JAMBI",
      "WITEL SUMUT",
    ],
  };

  const witelData = {
    "WITEL ACEH": [
      "TA SO CCAN BANDA ACEH WH",
      "TA SO CCAN LANGSA WH",
      "TA SO CCAN LHOKSEUMAWE WH",
      "TA SO CCAN MEULABOH WH",
      "TA SO CCAN TAKENGON WH",
      "TA SO CCAN TAPAKTUAN WH",
      "TA WITEL CCAN NAD (ACEH) WH",
    ],

    "WITEL LAMPUNG BENGKULU": [
      "TA SO CCAN BENGKULU WH",
      "TA SO CCAN CURUP WH",
      "TA SO CCAN IPUH WH",
      "TA SO CCAN KOTA BUMI WH",
      "TA SO CCAN LAMPUNG WH",
      "TA SO CCAN LIWA WH",
      "TA SO CCAN MANNA WH",
      "TA SO CCAN METRO WH",
      "TA SO CCAN UNIT 2 WH",
      "TA WITEL CCAN BENGKULU (BENGKULU) WH",
      "TA WITEL CCAN LAMPUNG (BANDAR LAMPUNG0 WH",
    ],

    "WITEL RIAU": [
      "TA SO CCAN ARENGKA WH",
      "TA SO BATAM CENTRE WH",
      "TA SO CCAN BATAM WH",
      "TA SO CCAN DUMAI WH",
      "TA SO CCAN DURI WH",
      "TA SO CCAN PEKANBARU WH",
      "TA SO CCAN RENGAT WH",
      "TA SO CCAN RUMBAI WH",
      "TA SO CCAN SAGULUNG WH",
      "TA SO CCAN TANJUNG BALAI KARIMUN WH",
      "TA SO CCAN TANJUNG PINANG WH",
      "TA SO CCAN TEMBILAHAN WH",
      "TA SO CCAN UJUNG BATU WH",
      "TA WITEL CCAN RIAU DARATAN (PEKANBARU) WH",
      "TA WITEL CCAN RIAU KEPULAUAN (BATAM) WH",
    ],

    "WITEL SUMBAGSEL": [
      "TA SO CCAN BATURAJA WH",
      "TA SO CCAN KAYUAGUNG WH",
      "TA SO CCAN KENTEN UJUNG WH",
      "TA SO CCAN KOBA WH",
      "TA SO CCAN LAHAT WH",
      "TA SO CCAN LUBUK LINGGAU WH",
      "TA SO CCAN MENTOK WH",
      "TA SO CCAN MUARA ENIM",
      "TA SO CCAN PALEMBANG CENTRUM WH",
      "TA SO CCAN PANGKALPINANG WH",
      "TA SO CCAN PRABUMULIH WH",
      "TA SO CCAN SEBRANG ULU WH",
      "TA SO CCAN SEKAYU WH",
      "TA SO CCAN SUNGAI LIAT WH",
      "TA SO CCAN TALANG KELAPA WH",
      "TA SO CCAN TANJUNG PANDAN WH",
      "TA WITEL CCAN BANGKA BELITUNG (PANGKAL PINANG) WH",
      "TA WITEL CCAN SUMATERA SELATAN (PALEMBANG) WH",
    ],

    "WITEL SUMBAR JAMBI": [
      "TA SO CCAN BUKITTINGGI WH",
      "TA SO CCAN JAMBI WH",
      "TA SO CCAN MUARA BUNGO WH",
      "TA SO CCAN PADANG WH",
      "TA SO CCAN PAYAKUMBUH WH",
      "TA SO CCAN SAROLANGUN WH",
      "TA SO CCAN SOLOK WH",
      "TA SO CCAN ULAKARANG WH",
      "TA WITEL CCAN JAMBI WH",
      "TA WITEL CCAN SUMATERA BARAT (PADANG) WH",
    ],

    "WITEL SUMUT": [
      "TA SO CCAN BINJAI WH",
      "TA SO CCAN CINTA DAMAI WH",
      "TA SO CCAN KABANJAHE WH",
      "TA SO CCAN KISARAN WH",
      "TA SO CCAN LUBUK PAKAM WH",
      "TA SO CCAN MEDAN CENTRUM WH",
      "TA SO CCAN PADANG BULAN WH",
      "TA SO CCAN PADANG SIDEMPUAN WH",
      "TA SO CCAN PEMATANGSIANTAR WH",
      "TA SO CCAN PULO BRAYAN WH",
      "TA SO CCAN RANTAU PRAPAT WH",
      "TA SO CCAN SIBOLGA WH",
      "TA SO CCAN SIMPANG LIMUN WH",
      "TA SO CCAN SUKA RAMAI WH",
      "TA SO CCAN TANJUNG MORAWA WH",
      "TA SO CCAN TANJUNG MULIA WH",
      "TA WITEL CCAN SUMUT BARAT (MEDAN) WH",
      "TA WITEL CCAN SUMUT TIMUR (PEMATANG SIANTAR) WH",
    ],
  };

  const randomVal = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Ambil data sesuai level
  let warehouses = [];
  if (selectedLevel === "treg") {
    warehouses = Object.keys(tregData);
  } else if (selectedLevel === "witel" && selectedWitel) {
    warehouses = tregData[selectedWitel];
  } else if (selectedLevel === "ta" && selectedWitel) {
    warehouses = witelData[selectedWitel] || [];
  }

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
                {warehouses.map((wh, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      if (selectedLevel === "treg") {
                        setSelectedWitel(wh);
                        setSelectedLevel("witel");
                      } else if (selectedLevel === "witel") {
                        setSelectedWitel(wh);
                        setSelectedLevel("ta");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="bg-abu fw-bold">{wh}</td>
                    <td>{randomVal(50, 150)}</td>
                    <td>{randomVal(50, 150)}</td>
                    <td>{randomVal(20, 80)}</td>
                    <td>{randomVal(80, 200)}</td>
                    <td>{randomVal(5, 30)}</td>
                    <td className="bg-success text-white fw-bold">
                      {randomVal(10, 50)}
                    </td>
                    <td>{randomVal(200, 500)}</td>
                    <td>{randomVal(100, 300)}</td>
                    <td>{randomVal(300, 600)}</td>
                    <td>{randomVal(100, 200)}</td>
                    <td>{randomVal(50, 150)}</td>
                    <td>{randomVal(150, 300)}</td>
                    <td>{randomVal(50, 150)}</td>
                    <td>{randomVal(50, 150)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Tombol back biar bisa naik level */}
          {selectedLevel !== "treg" && (
            <div className="px-3 py-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  if (selectedLevel === "ta") {
                    setSelectedLevel("witel");
                  } else if (selectedLevel === "witel") {
                    setSelectedLevel("treg");
                    setSelectedWitel(null);
                  }
                }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
