import { useState, useEffect } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore"; // Import updateDoc from firestore
import { auth, db } from "../../../Firebase"; // Ensure this imports your Firebase auth and firestore instance
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { useAuth } from "../../../AuthContext";
import "./Changepassword.css?v=0.0.2"; // import external css
import { useAuth } from "../../../AuthContext";

const Changepassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const validateForm = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage("All fields are required.");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match.");
      return false;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return false;
    }
    setMessage("");
    return true;
  };

  const role = localStorage.getItem("Role");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage("");
    const user = auth.currentUser;
    try {
      if (!user) throw new Error("User not authenticated. Please log in again.");
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      // Update password in the database
      const collectionName = role === "admin" ? "Admin" : "Users";
      const userDocRef = doc(db, collectionName, user.uid);
      await updateDoc(userDocRef, { password: newPassword });

      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error changing password:", error.message);
      if (error.code === "auth/wrong-password") {
        setMessage("The current password is incorrect.");
      } else if (error.code === "auth/invalid-credential") {
        setMessage("Invalid credentials. Please try again.");
      } else if (error.code === "auth/user-mismatch") {
        setMessage("User mismatch. Please log in again.");
      } else if (error.code === "auth/user-not-found") {
        setMessage("User not found. Please log in again.");
      } else {
        setMessage(error.message || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const { isSidebarVisible } = useAuth();

  return (
    <div className={`changepassword-container container-larger ${isSidebarVisible ? "sidebar-open" : " "}`}>
      <div className="page-title-wrapper">
        <div className="page-title-box">
          <h3 className="page-title">Change Password</h3>
          <div className="breadcrumb-wrapper">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/editprofile">Profile</Link>
              </li>
              <li className="breadcrumb-item active">Change Password</li>
            </ol>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleChangePassword}>
        <div className="changepassword-card-container shadow-lg">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Change Password</h4>
            </div>
            <div className="card-body">
              {message && (
                <div
                  className={`alert ${
                    message.includes("successfully") ? "alert-success" : "alert-danger"
                  }`}
                  role="alert"
                >
                  {message}
                </div>
              )}
              
              {/* Password Input Fields */}
              <div className="password-field-group">
                <div className="password-field">
                  <label htmlFor="currentPassword">Current Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="password-field">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>

                <div className="password-field">
                  <label htmlFor="confirmNewPassword">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      id="confirmNewPassword"
                      className="form-control"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                      {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              </div>

              <div className="button-wrapper">
                <button
                  type="submit"
                  className="btn btn-primary changepassword-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="button-content">
                      <span className="spinner-border spinner-border-sm" role="status" />
                      Changing Password...
                    </span>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Changepassword;
