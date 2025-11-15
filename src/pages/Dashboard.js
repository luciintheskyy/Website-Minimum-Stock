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
  const [notificationCount] = useState(3);
  const [lastUpdate, setLastUpdate] = useState("");
  const dropdownContainerRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
            <div className="position-relative">
              <button
                className="btn btn-light p-2 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "white", borderColor: "white" }}
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
                  className="dropdown-menu dropdown-menu-end show"
                  style={{ position: "absolute", right: 0, top: "60px" }}
                >
                  <div className="px-3 py-2" style={{ minWidth: 220 }}>
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={currentUser?.profile_picture_url || "/assets/ProfilePicture.svg"}
                        alt="Profile"
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div className="ms-2">
                        <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
                          {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : "User"}
                        </div>
                        <small className="text-muted">{currentUser?.role?.name || ""}</small>
                      </div>
                    </div>
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => {
                        if (currentUser) {
                          const mapped = mapMeToEditUser(currentUser);
                          setSelectedUser(mapped);
                          setActiveMenu("Edit User");
                        }
                        setProfileMenuOpen(false);
                      }}
                    >
                      <i className="fa-solid fa-user-pen me-2"></i>
                      Update Profile
                    </button>
                    <button
                      className="dropdown-item d-flex align-items-center text-danger"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logoutNow();
                      }}
                    >
                      <i className="fa-solid fa-right-from-bracket me-2"></i>
                      Logout
                    </button>
                  </div>
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
    </div>
  );
}
