import React, { useState } from "react";
import {
  collection,
  // addDoc,
  query,
  setDoc,
  where,
  getDocs,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import teamMemberImg from "A:/Expense Web/ExM/src/Component/navbar/team-member.jpg";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../Firebase";
import { FaRegEye, FaRegEyeSlash, FaCamera } from "react-icons/fa";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase imports
import { useAuth } from "../../AuthContext";
import "./Addemployee.css?v=0.0.1";
import src from "@emotion/styled";

const Addemployee = () => {
  const [username, setEmployeeName] = useState("");
  const [isActive, setEmployeeStatus] = useState("active");
  const [mobile, setPhoneNumber] = useState("");
  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loader State
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [employee_logo, setProfileImage] = useState(null); // To store image preview URL
  const [imageFile, setImageFile] = useState(null); // To store image file
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Save the file for later upload
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Cloudinary image upload function
  const uploadImageToCloudinary = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/due0loh2v/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const validateInputs = () => {
    const newErrors = {};

    if (!username && !mobile && !email && !password) {
      newErrors.general = "All fields are required.";
      setErrors(newErrors);
      return false;
    }

    if (!username) {
      newErrors.username = "Employee Name is required.";
    }
    if (!mobile) {
      newErrors.mobile = "Phone Number is required.";
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Phone number must be 10 digits.";
    }
    if (!email) {
      newErrors.email = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setLoading(true); // Start loader

    try {
      // Check if the email already exists
      const emailQuery = query(
        collection(db, "Users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        setErrors({ email: "Email address already exists." });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const EmployeeId = uuidv4();
      const adminId = localStorage.getItem("adminDocId");

      if (!adminId) {
        alert("Admin ID not found. Please log in again.");
        return;
      }

      // Upload image to Cloudinary only during form submission
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const employeeData = {
        authUid: user.uid,
        EmployeeId,
        password,
        username,
        mobile,
        roll: "employee",
        isActive : isActive,
        employee_logo: imageUrl,
        email,
        isSwitchOn:"" ,
        pin:"",
        adminId,
        createdAt: serverTimestamp(),
      };

      // Write to Firestore
      await setDoc(doc(db, "Users", user.uid), employeeData);

      // Clean up the local preview URL
      if (employee_logo) {
        URL.revokeObjectURL(employee_logo);
      }

      // localStorage.setItem("EmployeeDocId", user.uid);

      // Clear form and states
      setEmployeeName("");
      setPhoneNumber("");
      setEmailAddress("");
      setPassword("");
      setProfileImage(null);
      setImageFile(null);

      navigate("/employee_list");
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setLoading(false); // Stop loader
    }
  };

  const { isSidebarVisible } = useAuth();

  return (
    <div className={`container-larger add-employee-container ${isSidebarVisible ? "sidebar-open" : " "} `}>
      <div className="">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 page-title-main">
          <h3 className="page-title mb-3 mb-md-0">Employees</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              <li className="breadcrumb-item">
                <Link to="/employee_list">Employees</Link>
              </li>
              <li className="breadcrumb-item active">Add Employee</li>
            </ol>
          </nav>
        </div>

        <div className="card">
          <div className="card-header py-3">
            <h4 className="card-title m-0">Add Employee</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="profile-section">
                <div className="profile-image-wrapper">
                  <div className="profile-image">
                    {uploading ? (
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                    ) : (
                      <img src={employee_logo || teamMemberImg}  alt="Profile" />
                    )}
                  </div>
                  <div className="camera-icon-label">
                    <label htmlFor="imageInput" className="upload-label">
                      <FaCamera />
                    </label>
                  </div>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter employee name"
                    value={username}
                    onChange={(e) => setEmployeeName(e.target.value)}
                  />
                  {errors.username && (
                    <div className="text-danger">{errors.username}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        setPhoneNumber(value);
                      }
                    }}
                  />
                  {errors.mobile && (
                    <div className="text-danger">{errors.mobile}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                  {errors.email && (
                    <div className="text-danger">{errors.email}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Set Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      style={{ borderRadius: "4px" }}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </span>
                  </div>
                  {errors.password && (
                    <div className="text-danger">{errors.password}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Employee Status</label>
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="isActive"
                        id="statusActive"
                        value="active"
                        checked={isActive === "active"}
                        onChange={(e) => setEmployeeStatus(e.target.value)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="statusActive"
                      >
                        Active
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="isActive"
                        id="statusInactive"
                        value="inactive"
                        checked={isActive === "inactive"}
                        onChange={(e) => setEmployeeStatus(e.target.value)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="statusInactive"
                      >
                        Inactive
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                      </>
                    ) : (
                      "Add Employee"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addemployee;
