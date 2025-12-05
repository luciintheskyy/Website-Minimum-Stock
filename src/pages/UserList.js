import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

export default function UserList({ onAdd, onEdit }) {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // Search & Filters (meniru pola Request Outbond)
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState({ type: null, value: null });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const startRange = (currentPage - 1) * entriesPerPage + 1;
  // endRange akan dihitung setelah filter diterapkan

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

  // State untuk data dari API
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: entriesPerPage, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const mapRole = (role_id) => {
    if (role_id === 1) return "Admin";
    if (role_id === 2) return "Operator";
    return "User";
  };

  // Fetch users dari API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`, {
          params: { page: currentPage, per_page: entriesPerPage },
        });
        const data = res.data?.data || [];
        const metaRes = res.data?.meta || {};
        setUsers(
          data.map((u) => ({
            id: u.id,
            email: u.email,
            fullName: `${u.first_name} ${u.last_name}`.trim(),
            firstName: u.first_name,
            lastName: u.last_name,
            role: mapRole(u.role_id),
            role_id: u.role_id,
            asal: u.address,
            phone: u.phone,
            is_deleted: u.is_deleted,
          }))
        );
        setMeta({
          current_page: metaRes.current_page || currentPage,
          per_page: metaRes.per_page || entriesPerPage,
          total: metaRes.total ?? data.length,
          last_page: metaRes.last_page || 1,
        });
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API_BASE_URL, currentPage, entriesPerPage, reloadToken]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      text: "Aksi ini tidak bisa dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    setError(null);
    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      toast.success("User berhasil dihapus");
      // Trigger re-fetch
      setReloadToken(Date.now());
    } catch (e) {
      console.error(e);
      setError("Gagal menghapus user");
      toast.error("Gagal menghapus user");
    } finally {
      setDeletingId(null);
    }
  };

  // Terapkan search & filter
  const filteredRows = users.filter((row) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = q
      ? [row.email, row.fullName, row.role, row.asal]
          .some((v) => String(v).toLowerCase().includes(q))
      : true;

    let matchesFilter = true;
    if (selectedFilter.type === "role" && selectedFilter.value) {
      matchesFilter = row.role === selectedFilter.value;
    } else if (selectedFilter.type === "asal" && selectedFilter.value) {
      matchesFilter = row.asal === selectedFilter.value;
    }
    return matchesSearch && matchesFilter;
  });

  const totalData = meta.total || filteredRows.length;
  const endRange = Math.min(meta.current_page * meta.per_page, totalData);
  const totalPages = meta.last_page || Math.ceil(totalData / entriesPerPage) || 1;

  // Ambil data untuk halaman aktif
  const currentRows = filteredRows;

  // Tutup dropdown saat klik di luar (mirip Request Outbond)
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

  // Reset halaman ke 1 jika filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  return (
    <div className="mt-4 mb-4">
      {/* Header: Search & Filters */}
      <div
        className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2 rekap-actions"
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
        <button
          className="btn btn-danger ms-auto"
          onClick={() => onAdd && onAdd()}
          style={{ height: "38px" }}
        >
          Add User
        </button>
      </div>
      <div className="bg-white table-container-rounded rekap-table">
        <div className="table-responsive">
          <table className="table table-bordered table-sm text-center align-middle">
             <thead className="bg-abu">
              <tr>
                <th>No</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Asal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-3">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-3 text-danger">{error}</td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-3">No users found</td>
                </tr>
              ) : (
                currentRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{startRange + idx}</td>
                  <td>{row.email}</td>
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
                        onClick={() => onEdit && onEdit(row)}
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
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                      >
                        <img
                          src="/assets/Trash.svg"
                          alt="Delete"
                          style={{ width: "20px", height: "20px", opacity: deletingId === row.id ? 0.5 : 1 }}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
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

          {/* Info range data (diselaraskan mirip Request Outbond) */}
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
