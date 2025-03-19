import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "../../../Firebase";
import { FaCamera } from 'react-icons/fa';
import Swal from 'sweetalert2';
import defaultImage from "./team-member.jpg";
import './styles/EmployeeEditProfile.css?v=0.0.0';  // Import the external CSS
import { useAuth } from "../../../AuthContext";
import LoadingSpinner from '../../LoadingSpinner';

const EmployeeEditProfile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    employee_logo:""
  });
  const [localImage, setLocalImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false); // Track employee_logo upload
  const navigate = useNavigate();

  const userRole = localStorage.getItem("Role");
  const userDocId = localStorage.getItem(userRole === "admin" ? "adminDocId" : "EmployeeDocId");

  const fetchUserData = async () => {
    if (!userDocId) {
      Swal.fire("Error", "No user data found. Please log in.", "error");
      navigate("/");
      return;
    }

    setFetching(true);

    try {
      const userDocRef = doc(db, userRole === "admin" ? "Admin" : "Users", userDocId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        setFormData(userSnap.data());
      } else {
        Swal.fire("Error", "User data not found.", "error");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Swal.fire("Error", error.message || "Something went wrong.", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value.trimStart(),
    }));
  };

  const validateForm = () => {
    // Check username
    if (!formData.username || formData.username.trim() === "") {
      Swal.fire("Error", "Please enter your username", "error");
      return false;
    }
  
    // Check mobile number
    if (!formData.mobile || formData.mobile.trim() === "") {
      Swal.fire("Error", "Please enter your phone number", "error");
      return false;
    }
  
    // Validate mobile number format (optional)
    const mobileRegex = /^\d{10}$/;  // Assumes 10-digit phone number
    if (!mobileRegex.test(formData.mobile.trim())) {
      Swal.fire("Error", "Please enter a valid 10-digit phone number", "error");
      return false;
    }
  
    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      Swal.fire("Error", "Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Image size should be less than 5MB", "error");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      let downloadURL = formData.employee_logo;

      // Upload new image if selected
      if (imageFile) {
        const cloudinaryUrl = "https://api.cloudinary.com/v1_1/due0loh2v/image/upload";
        const uploadPreset = "ml_default";
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", imageFile);
        cloudinaryData.append("upload_preset", uploadPreset);

        const response = await fetch(cloudinaryUrl, {
          method: "POST",
          body: cloudinaryData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Cloudinary upload failed");
        }

        const data = await response.json();
        if (!data.secure_url) {
          throw new Error("No secure URL returned from Cloudinary");
        }
        downloadURL = data.secure_url;
      }

      if (!userDocId) {
        Swal.fire("Error", "Invalid user ID. Please try again.", "error");
        return;
      }

      const userDocRef = doc(db, userRole === "admin" ? "Admin" : "Users", userDocId);
      const updatedData = {
        ...formData,
        employee_logo: downloadURL
      };

      await updateDoc(userDocRef, updatedData);
      setImageFile(null);
      setLocalImage(null);
      Swal.fire("Success", "Profile updated successfully!", "success");
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire("Error", error.message || "Could not update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  if(loading) {
    return (
      <LoadingSpinner />
    );
  }

  const { isSidebarVisible } = useAuth();

  return (
    
    <div className={`editprofile-wrapper container-larger ${isSidebarVisible ? "sidebar-open" : ""}`}>
      <div className="editprofile-header">
        <div className="page-title-box">
          <h3 className="page-title">Edit Profile</h3>
          <div className="breadcrumb-container">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/editprofile">Profile</Link>
              </li>
              <li className="breadcrumb-item active">Edit Profile</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="editprofile-card-container">
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Edit Profile</h4>
          </div>
          <div className="card-body">
            {fetching ? (
              <div className="loader-container">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="profile-section">
                  <div className="profile-image-wrapper">
                    <div className="profile-image">
                      {uploading ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Uploading...</span>
                        </div>
                      ) : (
                        <img src={localImage || formData.employee_logo || defaultImage} alt="Profile" />
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
                      onChange={handleImageUpload}
                      hidden
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="EmployeeName">User Name</label>
                    <input
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      type="text"
                      className="form-control"
                      placeholder="Enter Name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      value={formData.email}
                      type="email"
                      className="form-control"
                      disabled
                      title="Email address cannot be changed"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Phone Number</label>
                    <input
                      id="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      type="tel"
                      className="form-control"
                      placeholder="Enter Phone Number"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary submit-btn" 
                    disabled={loading || uploading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditProfile;