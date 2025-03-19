import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../Firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, Link } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";
import defaultImage from "./team-member.jpg";
import { useAuth } from "../../../AuthContext";
import "./Editprofile.css?v=0.0.1";

const Editprofile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    company_name: "",
    phone: "",
    company_address: "",
    company_logo: "",
  });

  const [localImage, setLocalImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  // const [image] = useState(null);

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
    // Define required fields based on user role
    const requiredFields = userRole === "admin" 
      ? ["username", "phone", "company_name", "company_address"] 
      : ["username", "phone"];

    console.log("Validating fields:", requiredFields);
    console.log("Current form data:", formData);

    const isValid = requiredFields.every(field => {
      const value = formData[field]?.trim() || "";
      console.log(`Checking field ${field}:`, value);
      return value !== "";
    });

    if (!isValid) {
      Swal.fire("Error", "Please fill out all required fields.", "error");
    }

    return isValid;
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

    // Store the file for later upload
    setImageFile(file);
    // Create local preview
    setLocalImage(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/due0loh2v/image/upload";
    const uploadPreset = "ml_default";
    const cloudinaryData = new FormData();
    cloudinaryData.append("file", file);
    cloudinaryData.append("upload_preset", uploadPreset);

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudinaryData,
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Failed to upload image");
    }
    
    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("Image URL not found in response data");
    }
    
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      let imageUrl = formData.company_logo;

      // Upload image to Cloudinary if there's a new image
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      if (!userDocId) {
        Swal.fire("Error", "Invalid user ID. Please try again.", "error");
        return;
      }

      const userDocRef = doc(db, userRole === "admin" ? "Admin" : "Users", userDocId);

      const updatedData = {
        ...formData,
        company_logo: imageUrl
      };

      const changes = Object.entries(updatedData).reduce((acc, [key, value]) => {
        if (value !== "") acc[key] = value;
        return acc;
      }, {});

      if (Object.keys(changes).length === 0) {
        Swal.fire("Info", "No changes to update.", "info");
        return;
      }

      await updateDoc(userDocRef, changes);
      setImageFile(null); // Clear the stored file
      Swal.fire("Success", "Profile updated successfully!", "success");
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire("Error", error.message || "Could not update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const { isSidebarVisible } = useAuth();

  return (
    <div className={`container-larger editprofile-wrapper ${isSidebarVisible ? "sidebar-open" : ""}`}>
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
                        <img src={localImage || formData.company_logo || defaultImage} alt="Profile" />
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
                    <label htmlFor="username">User Name</label>
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

                  {userRole === "admin" && (
                    <div className="form-group">
                      <label htmlFor="company_name">Company Name</label>
                      <input
                        id="company_name" // Changed from "company"
                        value={formData.company_name}
                        onChange={handleChange}
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Name"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone" // Changed from "phonenumber"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      className="form-control"
                      placeholder="Enter Phone Number"
                    />
                  </div>

                  {userRole === "admin" && (
                    <div className="form-group full-width">
                      <label htmlFor="company_address">Company Address</label>
                      <input
                        id="company_address" 
                        value={formData.company_address}
                        onChange={handleChange}
                        type="text"
                        className="form-control"
                        placeholder="Enter Company Address"
                      />
                    </div>
                  )}
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

export default Editprofile;
