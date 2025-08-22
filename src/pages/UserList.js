import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

export default function UserList() {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalData = 10;

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  const endRange = Math.min(currentPage * entriesPerPage, totalData);

  const rows = [
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Admin",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Fiberhome",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
    {
      username: "ONT_FIBERHOME_HG6245N",
      password: "Premium",
      fullName: "Fiberhome",
      role: "Udara",
      asal: "Fiberhome",
      jenisAkun: "Admin",
    },
  ];

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
                <th>Jenis Akun</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.username}</td>
                  <td>{row.password}</td>
                  <td>{row.fullName}</td>
                  <td>{row.role}</td>
                  <td>{row.asal}</td>
                  <td>{row.jenisAkun}</td>
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
  );
}
