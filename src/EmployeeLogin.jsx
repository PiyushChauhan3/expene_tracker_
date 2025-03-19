import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, getDoc } from "firebase/firestore";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import './styles/EmployeeLogin.css';
import PinSetupModal from './Component/sidebar/PinSetupModal';
import PinVerificationModal from './Component/sidebar/PinVerificationModal';
import DefaultImage from './assets/images/default-profile.png';

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [employee, setEmployee] = useState("employee");
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [profileImage, setProfileImage] = useState(null);


  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFirebaseError = (code) => {
    switch (code) {
      case "auth/user-not-found":
        return "No user found with this email.";
      case "auth/invalid-credential":
        return "Incorrect password. Please try again.";
      case "auth/invalid-email":
        return "Invalid email format.";
      default:
        return "An error occurred. Please try again later.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const employeeDocRef = doc(db, "Users", user.uid);
      const employeeSnap = await getDoc(employeeDocRef);

      if (employeeSnap.exists()) {
        const employeeData = employeeSnap.data();
        localStorage.setItem("Role", employeeData?.roll);
        localStorage.setItem("EmployeeDocId", user.uid);
        localStorage.setItem("employee", employee);
        localStorage.setItem("isSwitchOn",employeeData?.isSwitchOn || false);

        // Fetch profile image
        setProfileImage(employeeData.employee_logo || DefaultImage);

        // Check if PIN is set
        if (employeeData.isSwitchOn === true) {
          setShowPinVerification(true);
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error("Employee record not found.");
      }
    } catch (err) {
      setError(handleFirebaseError(err.code) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetupSuccess = async () => {
    setShowPinSetup(false);
    navigate("/dashboard");
    await Swal.fire({
      title: "Login successful",
      text: "PIN has been set successfully",
      icon: "success",
    });
  };

  const handlePinVerification = async (pin) => {
    const employeeId = localStorage.getItem("EmployeeDocId");
    const employeeRef = doc(db, "Users", employeeId);
    const employeeDoc = await getDoc(employeeRef);
    
    if (employeeDoc.data()?.pin === pin) {
      setShowPinVerification(false);
      navigate("/dashboard");
      
      await Swal.fire({
        title: "Login successful",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Invalid PIN",
        icon: "error",
        
      });
    }
  };


  const EmpForgotPass = async (e) => {

    Swal.fire({
      title: "Error",
      text: "Please contact the administator to reset your password",
      icon: "error",
    });
    };

  return (
    <>
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="form-container">
              <form onSubmit={handleLogin}>
                <div className="employee-form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="employee-form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      id="password"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                  </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="d-flex justify-content-end mb-3">
                  <Link onClick={() => EmpForgotPass()} className="text-primary">Forgot password?</Link>
                </div>

                <button className="submit-button" type="submit" disabled={loading}>
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      Log In <i className="fas fa-sign-in-alt" />
                    </>
                  )}
                </button>
              </form>
              <div style={{height:"37px"}} className="text-center mt-3">
                <p className="footer-texts"></p>

              </div>
            </div>
          </div>
        </div>
      </div>

      <PinSetupModal
        show={showPinSetup}
        onHide={() => setShowPinSetup(false)}
        userId={localStorage.getItem("EmployeeDocId")}
        onSuccess={handlePinSetupSuccess}
        profileImage={profileImage}
        isEmployee={true}
      />
      
      <PinVerificationModal
        show={showPinVerification}
        onHide={() => setShowPinVerification(false)}
        onVerify={handlePinVerification}
        profileImage={profileImage}
      />
    </>
  );
};

export default EmployeeLogin;

