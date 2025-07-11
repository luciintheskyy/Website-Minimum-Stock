import React, {useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MinitokDashboard() {
  const [notificationCount, setNotificationCount] =useState(3);
  const [activeMenu, setActiveMenu] = useState("Minitok ONT");

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const menus = ["Minitok ONT", "Minitok AP", "Minitok Node B", "Minitok ONT Entherprise", "Request Outbond", "User List"];

  const hasDropdown = (menu) => !["Request Outbond", "User List"].includes(menu);

  const [activeSubTab, setActiveSubTab] = useState("Rekap Minimum Stock ONT");


  return (
    <div className="container-fluid bg-white min-vh-100">
      {/* === Header === */}
      <header className="d-flex justify-content-between align-items-center bg-white px-4 py-4">
        {/* LOGO Minimum Stok */}
        <div className="d-flex align-items-center gap-2">
          <img src="/assets/LogoMinitok.svg" alt="Logo Minitok" className="me-2" style={{ height: '50px' }}/>
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
                backgroundColor: activeMenu === menu ? "#EEF2F6" : "white"
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
        <div className="d-flex align-items-center" style={{gap: '8px'}}>
            <div className="position-relative">
              <button className="btn btn-light p-2 d-flex justify-content-center align-items-center" style={{backgroundColor: 'white', borderColor:'white'}}>
              <img src="/assets/Bell.svg" alt="Notifokasi" style={{width: '24px', height: '24px'}}/>
              </button>

              {/* Badge */}
              {notificationCount > 0 && (
                <span className="position-absolute badge rounded-pill bg-danger"
                style={{top: '2px', right: '2px', fontSize: '0.6rem'}}>
                  {notificationCount}
                </span>
              )}
            </div>

            <img src="/assets/ProfilePicture.svg" alt="Profile Picture" style={{ width: "50px", height: "50px" }}></img>
            
          </div>
      </header>

      {/* === Sub Tab === */}
      <div className="px-4 pt-2" style={{ backgroundColor: "#EEF2F6"}}>
        <div className="d-flex gap-4">
          {["Rekap Minimum Stock ONT", "Report Minimum Stock ONT"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`btn border-0 rounded-0 px-0 pb-3 ${
                activeSubTab === tab ? "text-danger border-bottom border-danger border-3" : "text-dark"
              }`}
              style={{ backgroundColor: 'transparent' }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
        <div className="row g-3 py-3">
          <div className="col-md-3">
            <div className="border rounded p-3 bg-white">
              <div className="text-muted small">Percentage</div>
              <div className="h4">77,90%</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3 bg-white">
              <div className="text-muted small">Red Status</div>
              <div className="h4 text-danger">53</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3 bg-white">
              <div className="text-muted small">Yellow Status</div>
              <div className="h4 text-warning">159</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3 bg-white">
              <div className="text-muted small">Green Status</div>
              <div className="h4 text-success">349</div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <p className="text-muted small pb-2">
          Last Update : 2025-05-02 09:59:30
        </p>

        {/* Filter & Search */}
        <div className="d-flex justify-content-between align-items-center py-2">
          <input
            type="text"
            placeholder="Search..."
            className="form-control w-25"
          />
          <div className="d-flex gap-2">
            <select className="form-select">
              <option>TREG</option>
            </select>
            <select className="form-select">
              <option>TA CCAN</option>
            </select>
            <button className="btn btn-outline-secondary">Export</button>
            <button className="btn btn-outline-secondary">Upload Data</button>
          </div>
        </div>

      {/* === Table === */}
      <div className="p-4 table-responsive">
        <table className="table table-bordered table-sm text-center">
          <thead className="table-light">
            <tr>
              <th rowSpan="2">Warehouse</th>
              <th colSpan="4">Stock SCMT (A)</th>
              <th colSpan="2">GAP Stock<br/>(A + C - B)</th>
              <th colSpan="3">Kebutuhan</th>
              <th colSpan="3">Minimum Stock<br/>Requirement Retail (B)</th>
              <th colSpan="2">On Delivery (C)</th>
            </tr>
            <tr>
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
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <tr key={i}>
                <td>WH TR TREG {i}</td>
                <td>61</td>
                <td>61</td>
                <td>23</td>
                <td>84</td>
                <td>4</td>
                <td className="bg-success text-white fw-bold">21</td>
                <td>280</td>
                <td>156</td>
                <td>444</td>
                <td>124</td>
                <td>91</td>
                <td>215</td>
                <td>80</td>
                <td>72</td>
              </tr>
            ))}
            <tr className="fw-bold">
              <td>Total</td>
              <td>61</td>
              <td>61</td>
              <td>23</td>
              <td>84</td>
              <td>4</td>
              <td className="bg-success text-white">21</td>
              <td>280</td>
              <td>156</td>
              <td>444</td>
              <td>124</td>
              <td>91</td>
              <td>215</td>
              <td>80</td>
              <td>72</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
