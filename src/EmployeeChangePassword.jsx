import React, { useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "./Firebase"; // Ensure this imports your Firebase auth instance
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import the icons

const EmployeeChangePassword = () => {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // States for toggling password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Form validation
  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Swal.fire("Error", "All fields are required.", "error");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      Swal.fire("Error", "New passwords do not match.", "error");
      return false;
    }
    if (newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters long.", "error");
      return false;
    }
    return true;
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const user = auth.currentUser;

    try {
      if (!user) throw new Error("User not authenticated. Please log in again.");

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      Swal.fire("Success", "Password updated successfully.", "success");

      // Clear input fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error.message);
      Swal.fire("Error", error.message || "Failed to change password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{marginRight:"110px"}}>

    
    <form onSubmit={handleChangePassword}>
    <div style={{ marginLeft: "270px", marginTop: "40px", marginRight: "96px" }}>
      <div className="" style={{ marginTop: "20px", marginLeft: "80px", width: "80vw" }}>
        <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
          <h3 className="page-title text-dark">Change Password</h3>
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
       
        <div>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="#" className="fs-5">
                Profile
              </a>
            </li>
           
            <li className="breadcrumb-item active fs-5">Change Password</li>
          </ol>
        </div>
      </div>
        </div>
      </div>

      <div className="col-md-12 col-lg-11" style={{ marginTop: "20px", marginLeft: "70px", marginBottom: "400px" }}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title" style={{ fontSize: "18px" }}>Change Password</h4>
          </div>
          <div className="card-body pt-0">
            <div className="mb-3 row">
              <label htmlFor="currentPassword" style={{ fontSize: "18px" }} className="col-sm-2 col-form-label">
                Current Password
              </label>
              <div className="col-sm-6 position-relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{  height: "60px", paddingRight: "30px" }} // Inline style for padding to make room for the icon
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "25px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="newPassword" style={{ fontSize: "18px" }} className="col-sm-2 col-form-label">
                New Password
              </label>
              <div className="col-sm-6 position-relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ height: "60px", paddingRight: "30px" }} // Inline style for padding to make room for the icon
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "25px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="mb-3 row">
              <label htmlFor="confirmNewPassword" style={{ fontSize: "18px" }} className="col-sm-2 col-form-label">
                Confirm Password
              </label>
              <div className="col-sm-6 position-relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  id="confirmNewPassword"
                  className="form-control"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  style={{ height: "60px", paddingRight: "30px" }} // Inline style for padding to make room for the icon
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "25px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-10 ma-auto">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
  </div>
  )
}

export default EmployeeChangePassword
