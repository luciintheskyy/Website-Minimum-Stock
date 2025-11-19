import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import RekapMinitokONT from "./RekapMinitokONT";
import ReportMinitokONT from "./ReportMinitokONT";
import RekapMinitokAP from "./RekapMinitokAP";
import ReportMinitokAP from "./ReportMinitokAP";
import RekapMinitokNodeB from "./RekapMinitokNodeB";
import ReportMinitokNodeB from "./ReportMinitokNodeB";
import RekapMinitokONTEntherprise from "./RekapMinitokONTEntherprise";
import ReportMinitokONTEntherprise from "./ReportMinitokONTEntherprise";
import RequestOutbond from "./RequestOutbond";
import UserList from "./UserList";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { subtab } = useParams(); // Ambil dari URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

  const [activeMenu, setActiveMenu] = useState("Minitok ONT");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");
  const dropdownContainerRef = useRef(null);
  const notifContainerRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsMeta, setLogsMeta] = useState({ current_page: 1, per_page: 15, total: 0 });

  const menus = [
    "Minitok ONT",
    "Minitok AP",
    "Minitok Node B",
    "Minitok ONT Entherprise",
    "Request Outbond",
    "User List",
  ];

  // Sub-tab berdasarkan menu
  const subTabsByMenu = {
    "Minitok ONT": {
      rekap: "Rekap Minimum Stock ONT",
      report: "Report Minimum Stock ONT",
    },
    "Minitok AP": {
      rekap: "Rekap Minimum Stock Access Point",
      report: "Report Minimum Stock Access Point",
    },
    "Minitok Node B": {
      rekap: "Rekap Minimum Stock Node B",
      report: "Report Minimum Stock Node B",
    },
    "Minitok ONT Entherprise": {
      rekap: "Rekap Minimum Stock ONT Entherprise",
      report: "Report Minimum Stock ONT Entherprise",
    },
  };

  // Ambil subtab & validasi
  const validSubTabs = ["rekap", "report"];
  const currentSubTab = validSubTabs.includes(subtab) ? subtab : "rekap";

  const hasSubTab =
    activeMenu === "Minitok ONT" ||
    activeMenu === "Minitok AP" ||
    activeMenu === "Minitok Node B" ||
    activeMenu === "Minitok ONT Entherprise";

  // Ganti sub-tab → update URL
  const handleSubTabClick = (tab) => {
    let basePath = "";
    if (activeMenu === "Minitok ONT") basePath = "/minitok-ont";
    else if (activeMenu === "Minitok AP") basePath = "/minitok-ap";
    else if (activeMenu === "Minitok Node B") basePath = "/minitok-nodeb";
    else if (activeMenu === "Minitok ONT Entherprise")
      basePath = "/minitok-ontentherprise";

    if (basePath) navigate(`${basePath}/${tab}`);
  };

  // Menu klik
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === "Minitok ONT") navigate("/minitok-ont/rekap");
    if (menu === "Minitok AP") navigate("/minitok-ap/rekap");
    if (menu === "Minitok Node B") navigate("/minitok-nodeb/rekap");
    if (menu === "Minitok ONT Entherprise")
      navigate("/minitok-ontentherprise/rekap");
    if (menu === "User List") setSelectedUser(null);
  };

  const hasDropdown = (menu) =>
    !["Request Outbond", "User List"].includes(menu);

  // Last Update Mock
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

  // Fetch current user (/api/me)
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/me`);
        const me = res.data?.user || null;
        setCurrentUser(me);
        if (me?.id) {
          try { localStorage.setItem("current_user_id", String(me.id)); } catch (_) {}
        }
      } catch (e) {
        // ignore; handled by 401 interceptor if unauthenticated
        console.error(e);
      }
    };
    fetchMe();
  }, [API_BASE_URL]);

  const logoutNow = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (e) {
      // ignore
    }
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
    navigate("/login", { replace: true });
  };

  const mapMeToEditUser = (me) => ({
    id: me?.id,
    firstName: me?.first_name || "",
    lastName: me?.last_name || "",
    asal: me?.address || "",
    phone: me?.phone || "",
    role_id: me?.role?.role_id || "",
    email: me?.email || "",
    is_deleted: false,
  });

  // Dropdown handlers
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

  // Tutup dropdown notifikasi saat klik di luar area bell/menu
  useEffect(() => {
    const handleClickOutsideNotif = (event) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideNotif);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideNotif);
    };
  }, []);

  return (
    <div className="container-fluid bg-white min-vh-100">
      {/* === Header (Fixed di Top) === */}
      <header className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center bg-white px-4 py-4">
          {/* LOGO Minimum Stok */}
          <div className="d-flex align-items-center gap-2">
            <img
              src="/assets/LogoMinitok.svg"
              alt="Logo Minitok"
              className="me-2"
              style={{ height: "50px" }}
            />
          </div>

          {/* Menu Buttons */}
          <div className="d-flex align-items-center gap-2">
            {menus.map((menu) => (
              <button
                key={menu}
                onClick={() => handleMenuClick(menu)}
                className={`btn border-white fw-medium d-flex align-items-center ${
                  activeMenu === menu ? "text-danger" : "text-dark"
                }`}
                style={{
                  backgroundColor: activeMenu === menu ? "#EEF2F6" : "white",
                }}
              >
                <span>{menu}</span>

                {hasDropdown(menu) && (
                  <img
                    src={
                      activeMenu === menu
                        ? "/assets/CaretDownRedBold.svg"
                        : "/assets/CaretDownBold.svg"
                    }
                    alt="Caret"
                    style={{ width: "20px", height: "20px", marginLeft: "6px" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/*Notification & Profile */}
          <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <div className="position-relative" ref={notifContainerRef}>
            <button
              className="btn btn-light p-2 d-flex justify-content-center align-items-center"
              style={{ backgroundColor: "white", borderColor: "white" }}
              onClick={() => {
                setNotifOpen((prev) => !prev);
                const uid = currentUser?.id || Number(localStorage.getItem("current_user_id"));
                setLogsLoading(true);
                axios
                  .get(`${API_BASE_URL}/api/activity-logs`, {
                    params: { user_id: uid || undefined, per_page: 15, page: 1 },
                  })
                  .then((res) => {
                    const data = res.data?.data || [];
                    const meta = res.data?.meta || { current_page: 1, per_page: 15, total: data.length };
                    setActivityLogs(data);
                    setLogsMeta(meta);
                    setNotificationCount(meta.total || data.length || 0);
                  })
                  .catch((e) => {
                    console.error(e);
                    setActivityLogs([]);
                    setNotificationCount(0);
                  })
                  .finally(() => setLogsLoading(false));
              }}
            >
              <img
                src="/assets/Bell.svg"
                alt="Notifokasi"
                style={{ width: "24px", height: "24px" }}
              />
            </button>
              {notificationCount > 0 && (
                <span
                  className="position-absolute badge rounded-pill bg-danger"
                  style={{ top: "2px", right: "2px", fontSize: "0.6rem" }}
                >
                  {notificationCount}
                </span>
              )}
            </div>
            <div className="position-relative" ref={dropdownContainerRef}>
              <button
                className="btn p-0 border-0"
                aria-haspopup="true"
                aria-expanded={profileMenuOpen ? "true" : "false"}
                onClick={() => setProfileMenuOpen((s) => !s)}
              >
                <img
                  src={currentUser?.profile_picture_url || "/assets/ProfilePicture.svg"}
                  alt="Profile"
                  style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                />
              </button>
              {profileMenuOpen && (
                <div
                  className="profile-menu-panel"
                  style={{ position: "absolute", right: 0, top: "60px" }}
                >
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      if (currentUser) {
                        const mapped = mapMeToEditUser(currentUser);
                        setSelectedUser(mapped);
                        setActiveMenu("Edit User");
                      }
                      setProfileMenuOpen(false);
                    }}
                  >
                    <i className="fa-regular fa-user me-2"></i>
                    <span>Account</span>
                  </button>
                  <button
                    className="profile-menu-item"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logoutNow();
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket me-2"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* === Sub Tab (Sticky di Bawah Header, Hanya untuk Menu Minitok) === */}
      {hasSubTab && (
        <div className="dashboard-subtab">
          <div
            className="px-4 pt-2 mb-1"
            style={{ backgroundColor: "#EEF2F6" }}
          >
            <div className="d-flex gap-4">
              {Object.entries(subTabsByMenu[activeMenu]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleSubTabClick(key)}
                  className={`btn border-0 rounded-0 px-0 pb-3 ${
                    currentSubTab === key
                      ? "text-danger border-bottom border-danger border-3"
                      : "text-dark"
                  }`}
                  style={{ backgroundColor: "transparent" }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === Konten Utama (Scrollable dengan Padding-Top Dynamic) === */}
      <main className={`dashboard-content ${hasSubTab ? "with-subtab" : ""}`}>
        {activeMenu === "Minitok ONT" && currentSubTab === "rekap" && (
          <RekapMinitokONT />
        )}
        {activeMenu === "Minitok ONT" && currentSubTab === "report" && (
          <ReportMinitokONT />
        )}
        {activeMenu === "Minitok AP" && currentSubTab === "rekap" && (
          <RekapMinitokAP />
        )}
        {activeMenu === "Minitok AP" && currentSubTab === "report" && (
          <ReportMinitokAP />
        )}
        {activeMenu === "Minitok Node B" && currentSubTab === "rekap" && (
          <RekapMinitokNodeB />
        )}
        {activeMenu === "Minitok Node B" && currentSubTab === "report" && (
          <ReportMinitokNodeB />
        )}
        {activeMenu === "Minitok ONT Entherprise" &&
          currentSubTab === "rekap" && <RekapMinitokONTEntherprise />}
        {activeMenu === "Minitok ONT Entherprise" &&
          currentSubTab === "report" && <ReportMinitokONTEntherprise />}
        {activeMenu === "Request Outbond" && <RequestOutbond />}
        {activeMenu === "User List" && (
          <UserList
            onAdd={() => setActiveMenu("Add User")}
            onEdit={(row) => {
              setSelectedUser(row);
              setActiveMenu("Edit User");
            }}
          />
        )}
        {activeMenu === "Add User" && (
          <AddUser
            onSaved={() => setActiveMenu("User List")}
            onCancel={() => setActiveMenu("User List")}
          />
        )}
        {activeMenu === "Edit User" && selectedUser && (
          <EditUser
            user={selectedUser}
            onSaved={() => {
              setSelectedUser(null);
              setActiveMenu("User List");
            }}
            onCancel={() => {
              setSelectedUser(null);
              setActiveMenu("User List");
            }}
          />
        )}
      </main>
      {notifOpen && (
        <div
          className="profile-menu-panel"
          style={{ position: "absolute", right: 74, top: 76, width: 360 }}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="d-flex justify-content-between align-items-center px-3 pt-3">
            <h6 className="mb-0">Notifications</h6>
            <button className="btn btn-sm" onClick={() => setNotifOpen(false)} aria-label="Close notifications">
              ×
            </button>
          </div>
          <div className="px-3 d-flex gap-4 border-bottom mt-2">
            <button className="btn btn-link text-dark" style={{ textDecoration: "none" }}>General</button>
            <button className="btn btn-link text-danger" style={{ textDecoration: "none", borderBottom: "2px solid #CB3A31" }}>Messages</button>
          </div>
          <div className="px-3 py-2" style={{ maxHeight: 360, overflowY: "auto" }}>
            {logsLoading ? (
              <div className="text-center text-muted py-3">Loading...</div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center text-muted py-3">Tidak ada aktivitas</div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="d-flex align-items-start gap-3 py-3 border-bottom">
                  <img src="/assets/ProfilePicture.svg" alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                  <div className="flex-grow-1">
                    <div><span className="fw-semibold">{String(log.user.first_name) + ' ' + String(log.user.last_name)}</span> telah {log.activity}</div>
                    <div className="text-muted small">{formatRelative(log.timestamp || log.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelative(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? "s" : ""} ago`;
  } catch {
    return iso || "";
  }
}
