import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function UserList() {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalData = 53; // contoh kalau data lebih banyak

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRange = Math.min(currentPage * entriesPerPage, totalData);

  // Pilihan asal
  const asalOptions = [
    "TREG 1",
    "TREG 2",
    "TREG 3",
    "TREG 4",
    "TREG 5",
    "TREG 6",
    "TREG 7",
    "DID",
    "Nokia",
    "Fiberhome",
    "ZTE",
    "Huawei",
  ];

  // Data dummy user
  const rows = Array.from({ length: totalData }, (_, idx) => ({
    username: `user_${idx + 1}`,
    password: "********",
    fullName: `User ${idx + 1}`,
    role: idx % 2 === 0 ? "Admin" : "User",
    asal: asalOptions[Math.floor(Math.random() * asalOptions.length)],
  }));

  // Hitung jumlah halaman
  const totalPages = Math.ceil(totalData / entriesPerPage);

  // Ambil data untuk halaman aktif
  const currentRows = rows.slice(startRange - 1, endRange);

  return (
    <div className="mt-4 mb-4">
      <div className="bg-white table-container-rounded">
        <div className="table-responsive">
          <table className="table table-bordered table-sm text-center align-middle">
            <thead className="bg-abu">
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Password</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Asal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{startRange + idx}</td>
                  <td>{row.username}</td>
                  <td>{row.password}</td>
                  <td>{row.fullName}</td>
                  <td>{row.role}</td>
                  <td>{row.asal}</td>
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
          {/* Dropdown jumlah entries */}
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

          {/* Tombol halaman */}
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

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
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
              );
            })}

            <button
              className="btn btn-sm"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E3E8EF",
                color: "#6c757d",
              }}
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              &gt;
            </button>
          </div>

          {/* Info range data */}
          <div
            className="small d-flex align-items-center justify-content-center"
            style={{
              minWidth: "80px",
              height: "32px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E8EF",
              borderRadius: "6px",
              color: "#6c757d",
            }}
          >
            {startRange}-{endRange} of {totalData}
          </div>
        </div>
      </div>
    </div>
  );
}
