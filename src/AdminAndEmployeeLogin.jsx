import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Admin/AdminAndEmployeeLogin.css";
import AdminLogin from "./Component/sidebar/AdminLogin";
import EmployeeLogin from "./EmployeeLogin";
import background from "./assets/background.png";

const TabView = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Admin Login");

  useEffect(() => {
    setActiveTab("Admin Login");
  }, [location.pathname]);


  const clearloc = () => {
    localStorage.clear();
  }
  return (
    <div className="tabview-container">
      <div className="tab-view-card">
        {/* Tabs */}
        <div className="tab-buttons">
          <button
            onClick={() => {setActiveTab("Admin Login");
              clearloc();}}
            className={`tab-button ${activeTab === "Admin Login" ? "active" : ""}`}
          >
            Admin Login
          </button>
          <button
            onClick={() => {setActiveTab("Employee Login");
              clearloc();}}
            className={`tab-button ${activeTab === "Employee Login" ? "active" : ""}`}
          >
            Employee Login
          </button>
        </div>

        {/* Tab Content */}
        <div className="Login-container">
          {activeTab === "Admin Login" && <AdminLogin />}
          {activeTab === "Employee Login" && <EmployeeLogin />}
        </div>
      </div>
    </div>
  );
};

export default TabView;
