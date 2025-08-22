import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { subtab } = useParams(); // Ambil dari URL

  const [activeMenu, setActiveMenu] = useState("Minitok ONT");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [notificationCount] = useState(3);
  const [lastUpdate, setLastUpdate] = useState("");
  const dropdownContainerRef = useRef(null);

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
      {/* === Header === */}
      <header className="d-flex justify-content-between align-items-center bg-white px-4 py-4">
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

          <img
            src="/assets/ProfilePicture.svg"
            alt="Profile Picture"
            style={{ width: "50px", height: "50px" }}
          />
        </div>
      </header>

      {/* === Sub Tab (khusus ONT & AP) === */}
      {(activeMenu === "Minitok ONT" ||
        activeMenu === "Minitok AP" ||
        activeMenu === "Minitok Node B" ||
        activeMenu === "Minitok ONT Entherprise") && (
        <div className="px-4 pt-2 mb-1" style={{ backgroundColor: "#EEF2F6" }}>
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
      )}

      {/* === Konten Utama === */}
      <>
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
        {activeMenu === "User List" && <UserList />}
      </>
    </div>
  );
}
