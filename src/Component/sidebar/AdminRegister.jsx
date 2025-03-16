import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, setDoc, serverTimestamp, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../../Firebase";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import "./AdminRegister.css";
import { error } from "ajv/dist/vocabularies/applicator/dependencies";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [company_name, setCompany_name] = useState("");
  const [company_address, setCompany_address] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email = "Please enter a valid Gmail address.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Valid 10-digit phone number is required";
    }
    if (!company_name) newErrors.company = "Company name is required";
    if (!company_address) newErrors.companyAddress = "Company address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("adminDocId", user.uid);
      localStorage.setItem("Role", "admin");
      const adminId = uuidv4();

      const adminData = {
        adminId,
        authUid: user.uid,
        username,
        email,
        phone,
        password,
        company_name,
        company_address,
        company_logo: "",
        role: "admin",
        createdAt: serverTimestamp(),
      };

      const adminDocRef = await setDoc(doc(db, "Admin", user.uid), adminData);

      localStorage.setItem("adminDocId", user.uid);
      navigate("/dashboard");

      const expensesCollectionRef = collection(db, `Admin/${user.uid}/expense`);

      Swal.fire({
        title: "Registration successful",
        text: "You have successfully registered as an admin.",
        icon: "success",
      });

      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setCompany_name("");
      setCompany_address("");
      setErrors({});
    } catch (error) {
        // console.error("Error:", error.message);
      
        if (error.code === "auth/email-already-in-use") {
          Swal.fire({
            title: "Email already in use",
            text: "This email is already in use. Please try a different email.",
            icon: "error",
          });
        
      }

      // Swal.fire({
      //   title: "Error",
      //   text: error.message,
      //   icon: "error",
      // });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="register-form">
      <div className="register-container">
        <div className="register-wrapper">
          <div className="register-card">
            <div className="auth-header">
              <div className="text-center p-3">
                <h4 className="header-title">Create Admin account</h4>
                <p className="header-subtitle">
                  Enter your details to create your account today.
                </p>
              </div>
            </div>
            <div className="form-container">
              <div className="form-group reg-form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className="form-input"
                  id="username"
                  required
                />
                {errors.username && <small className="error-text">{errors.username}</small>}
              </div>
              <div className="form-group reg-form-group">
                <label className="form-label" htmlFor="useremail">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="form-input"
                  id="useremail"
                  required
                />
                {errors.email && <small className="error-text">{errors.email}</small>}
              </div>
              <div className="reg-form-group password-group">
                <label className="form-label" htmlFor="userpassword">Password</label>
                <div className="password-input-wrapper">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    id="userpassword"
                    required
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </span>
                </div>
                {errors.password && <small className="error-text">{errors.password}</small>}
              </div>
              <div className="form-group reg-form-group">
                <label className="form-label" htmlFor="company">Company</label>
                <input
                  value={company_name}
                  onChange={(e) => setCompany_name(e.target.value)}
                  type="text"
                  className="form-input"
                  id="company"
                  required
                />
                {errors.company && <small className="error-text">{errors.company}</small>}
              </div>
              <div className="form-group reg-form-group">
                <label className="form-label" htmlFor="companyAddress">Company Address</label>
                <input
                  value={company_address}
                  onChange={(e) => setCompany_address(e.target.value)}
                  type="text"
                  className="form-input"
                  id="companyAddress"
                  required
                />
                {errors.companyAddress && <small className="error-text">{errors.company_address}</small>}
              </div>
              <div className="form-group reg-form-group">
                <label className="form-label" htmlFor="mobileNo">Mobile Number</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setPhone(value);
                    }
                  }}
                  type="text"
                  className="form-input"
                  id="mobileNo"
                  required
                />
                {errors.phonenumber && <small className="error-text">{errors.phonenumber}</small>}
              </div>
              <div className="terms-group">
                <div className="checkbox-wrapper d-flex align-items-center gap-1 mb-3">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    id="terms"
                    required
                  />
                  <label htmlFor="terms" className="checkbox-label">
                    By registering you agree to the Approx{" "}
                    <a href="#" className="terms-link">Terms of Use</a>
                  </label>
                </div>
              </div>
              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? (
                  <span className="loading-text">
                    <span className="spinner"></span>
                  </span>
                ) : (
                  "Register"
                )}
              </button>
              <div className="login-link-container">
                <p className="login-text">
                  Already have an account?{" "}
                  <Link to="/" className="login-link">Log in</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Register;
