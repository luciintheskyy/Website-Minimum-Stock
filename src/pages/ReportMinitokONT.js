import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function ReportMinitokONT() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownContainerRef = useRef(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalData = 539;
  const [selectedTregs, setSelectedTregs] = useState([
    "TREG 1",
    "TREG 2",
    "TREG 3",
    "TREG 4",
    "TREG 5",
  ]);

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
                {["Export Data", "Export All SN"].map((option, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option); // Console.log, tidak ubah tabel
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
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Template */}
          <button
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
            onClick={() => {
              setActiveDropdown(null); // FIX: Tutup dropdown manapun
              console.log("Download Template clicked"); // Dummy logic
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
          <button
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
            onClick={() => {
              setActiveDropdown(null); // FIX: Tutup dropdown manapun
              console.log("Download Template clicked"); // Dummy logic
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
