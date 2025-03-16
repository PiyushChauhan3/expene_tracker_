import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import defaultImage from "./Component/sidebar/Home/team-member.jpg";
import "./styles/Profile.css?v=1.2.1";

import LoadingSpinner from "./Component/LoadingSpinner";

const Profile = () => {
  useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSidebarVisible } = useAuth();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const userId = localStorage.getItem("EmployeeDocId");
      if (!userId) return;

      try {
        const docRef = doc(db, `Users/${userId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEmployeeData(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load profile data",
          icon: "error"
        });
      }
    };

    const fetchAdminData = async () => {
      const userId = localStorage.getItem("EmployeeDocId");
      if (!userId) return;

      try {
        const docRef = doc(db, `Users/${userId}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const empData = docSnap.data();
          if (empData.adminId) {
            const adminDocRef = doc(db, `Admin/${empData.adminId}`);
            const adminDocSnap = await getDoc(adminDocRef);
            if (adminDocSnap.exists()) {
              setAdminData(adminDocSnap.data());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load admin data",
          icon: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
     <LoadingSpinner />
    );
  }

  return (
    <div className={`profile-wrapper container-larger ${isSidebarVisible ? 'sidebar-open' : ''}`}>
      <div className="profile-container">
        <div className="page-title-box d-flex justify-content-between align-items-center mb-4">
          <h3 className="page-title text-dark">Profile</h3>
          <div>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/profile">Profile</Link>
              </li>
              <li className="breadcrumb-item active"></li>
            </ol>
          </div>
        </div>

        {employeeData && (
          <div className="info-card">
            <div className="row">
              <div className="col-md-3 text-center profile-image-profile">
                <img
                  src={employeeData.employee_logo || defaultImage}
                  alt="Employee Profile"
                  className="profile-images"
                />
              </div>
              <div className="col-md-9 emp-detail-container">
                <div className="card-title">Employee Profile</div>
                <div className="email-text">{employeeData.email}</div>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{employeeData.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{employeeData.mobile}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{employeeData.address || 'N/A'}</span>
                </div>
                <div className="action-buttons">
                  <Link to="/EmployeeEditProfile" className="action-button">Edit Profile</Link>
                  <Link to="/changepassword" className="action-button">Change Password</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {adminData && (
          <div className="info-card">
            <div className="row">
              <div className="col-md-3 profile-image-profile text-center">
                <img
                  src={adminData.company_logo || defaultImage}
                  alt="Admin Profile"
                  className="profile-images"
                />
              </div>
              <div className="col-md-9 emp-detail-container">
                <div className="card-title">{adminData.company_name}</div>
                <div className="email-text">{adminData.email}</div>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{adminData.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contact:</span>
                  <span className="info-value">{adminData.phone}</span>
                </div>
                <div className="info-row"></div>
                  <span className="info-label">Address:</span>
                  <span className="info-value ">{adminData.company_address || 'N/A'}</span>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;