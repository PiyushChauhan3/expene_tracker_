import { useState, useEffect, useRef } from "react";  // Add useRef to imports
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import Swal from "sweetalert2";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore"; // Add setDoc
import { db } from "../../Firebase";
// import { getStorage, ref, getDownloadURL } from "firebase/storage";
import defaultImage from "./team-member.jpg";
import logo from "../../assets/images/1.png";
import { Navbar as BNavbar} from "react-bootstrap";
import { Link } from "react-router-dom";
import PinSetupModal from "../sidebar/PinSetupModal"; // Add this import
import "./Navbar.css?v=1.5.6";

function Navbar() {
  const { logout, isSidebarVisible, toggleSidebar } = useAuth();
const navigate = useNavigate();
const [loading, setLoading] = useState(true);
const [formData, setFormData] = useState({
  username: "",
  email: "",
  image: "",
  role: "",
  type: ""
});

const adminId = localStorage.getItem("adminDocId");
  const employeeId = localStorage.getItem("EmployeeDocId");
  const userId = adminId || employeeId;
const Role = adminId ? "admin" : "employee";

const menuButtonRef = useRef(null); // Add ref for menu button

const [showPinModal, setShowPinModal] = useState(false);
const [isSwitchOn, setIsPinSet] = useState(false);
const [pinToggle, setPinToggle] = useState(false);

const handlePinSet = async (pin) => {
  const adminId = localStorage.getItem("adminDocId");
  const employeeId = localStorage.getItem("EmployeeDocId");
  const userIde = adminId || employeeId;
  const Role = adminId ? "admin" : "employee";
  const collectionPath = Role === "admin" ? "Admin" : "Users";

  try {
    await setDoc(doc(db, collectionPath, userIde), { 
      pin,
      isSwitchOn: true 
    }, { merge: true });
    
    setIsPinSet(true);
    setPinToggle(true);
    localStorage.setItem('isSwitchOn', 'true');
    setShowPinModal(false);
    
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "PIN set successfully!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      width: "250px",
    });
  } catch (error) {
    console.error("Error setting PIN:", error);
    setPinToggle(false);
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: "Failed to set PIN",
      text: "Please try again",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      width: "250px",
    });
  }
};

// Add this useEffect to check PIN status
useEffect(() => {
  const checkPinStatus = async () => {
    const adminId = localStorage.getItem("adminDocId");
    const employeeId = localStorage.getItem("EmployeeDocId");
    const userIde = adminId || employeeId;
    const Role = adminId ? "admin" : "employee";
    const collectionPath = Role === "admin" ? "Admin" : "Users";

    if (userIde) {
      const userDoc = await getDoc(doc(db, collectionPath, userIde));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPinToggle(!!userData.isSwitchOn);
        setIsPinSet(!!userData.pin);
      }
    }
  };

  checkPinStatus();
}, [db]);

useEffect(() => {
  if (!userId) {
    Swal.fire("Error", "Authentication required", "error");
    navigate("/");
    return;
  }

  const collectionPath = Role === "admin" ? "Admin" : "Users";
  const docRef = doc(db, collectionPath, userId);

  const unsubscribe = onSnapshot(docRef, async (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.data();
      try {
        const imageUrl = Role === "admin" ? userData.company_logo : userData.employee_logo || "";
        setFormData({
          ...userData,
          image: imageUrl,
          type: Role,
          role: localStorage.getItem("Role") || Role
        });
      } catch {
        setFormData({
          ...userData,
          image: "",
          type: Role,
          role: localStorage.getItem("Role") || Role
        });
      }
      setLoading(false);
    } else {
      Swal.fire("Error", "User data not found", "error");
    }
  });

  return () => unsubscribe();
}, []);

// useEffect(() => {
//   const handleClickOutside = (event) => {
//     // Don't close if clicking menu button or its children
//     if (menuButtonRef.current && 
//         (menuButtonRef.current === event.target || 
//          menuButtonRef.current.contains(event.target))) {
//       return;
//     }

//     // Only close if sidebar is visible and click is outside
//     if (isSidebarVisible) {
//       toggleSidebar();
//     }
//   };

//   // Use mousedown instead of mouseup for better touch response
//   document.addEventListener('mousedown', handleClickOutside);
  
//   // Proper cleanup
//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, [isSidebarVisible, toggleSidebar]);

const handleLogout = async (e) => {
  e.preventDefault();
  try {
    localStorage.clear(); // Clear all items from localStorage
    await logout();
    navigate("/", { replace: true });
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Logged out successfully!",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  } catch {
    Swal.fire("Error", "Logout failed", "error");
  }
};

  return (
    <div className={`navbar-container  `}>
      <div className="container-fluid">
        <nav className="topbar-custom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button
              ref={menuButtonRef} // Add ref to the button
              type="button"
              aria-label="Toggle Sidebar"
              className="btn btn-light toggle-button d-flex align-items-center justify-content-center"
              onClick={(e) => {
                e.stopPropagation(); // Prevent event bubbling
                toggleSidebar();
              }}
            >
              {isSidebarVisible ? (
                <i className="fa-solid fa-xmark fs-5"></i>
              ) : (
                <i className="iconoir-menu fs-5"></i>
              )}
            </button>

            <BNavbar.Brand 
              as={Link} 
              to="/dashboard" 
              className="text-dark brand-container d-flex align-items-center  bg-light"
              style={{
                width: "220px",
                height: "50px",
                // padding: "0 15px",
                borderRadius: "10px",
                marginLeft: "10px"
              }}
            >
              <img
                src={logo}
                alt="Logo"
                className="brand-logo"
              />
              <span className="brand-text">
                Expense Tracker
              </span>
            </BNavbar.Brand>
          </div>

          <ul className="topbar-item list-unstyled d-flex align-items-center mb-0">
            <li className="username-display">
              {loading
                ? "Loading..."
                : Role === "admin"
                ? formData.username
                : formData.username}
            </li>
            <li className="dropdown topbar-item">
              <a
                className="nav-link dropdown-toggle text-light d-flex align-items-center dropdown-trigger"
                data-bs-toggle="dropdown"
              >
                <img
                  className="profile-imag rounded-circle border border-primary"
                  src={formData.image || defaultImage}
                  alt="Profile"
                />
              </a>
              <div className="dropdown-menu dropdown-menu-end shadow-lg">
                <div className="d-flex align-items-center dropdown-item bg-light">
                  <img
                    className="thumb-md rounded-circle border border-secondary"
                    src={formData.image || defaultImage}
                    alt="Profile"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover"
                    }}
                  />
                  <div className="ms-3 text-truncate">
                    <h6 className="my-0 fw-semibold text-dark fs-14">
                      {Role === "admin"
                        ? formData.username
                        : formData.username}
                    </h6>
                    <small className="text-muted">
                      {Role === "admin"
                        ? formData.email
                        : formData.email}
                    </small>
                  </div>
                </div>
                {/* <div className="dropdown-divider" /> */}
                {Role === "employee" && (
                  <Link
                    className="dropdown-item text-primary bg-light fw-medium"
                    to="/profile"
                    >
                    <i className="las la-user fs-18 me-2" /> Profile

                    </Link>)}
                    {/* <div className="dropdown-divider my-2" />     */}
                <Link
                  className="dropdown-item text-primary bg-light fw-medium"
                  to="/editprofile"
                >
                  <i className="las la-user fs-18 me-2" /> Edit Profile
                </Link>
                {/* <div className="dropdown-divider my-2" /> */}
                <Link
                  className="dropdown-item text-primary bg-light fw-medium"
                  to="/changepassword"
                >
                  <i className="las la-lock fs-18 me-2" /> Change Password
                </Link>
                {/* <div className="dropdown-divider my-2" /> */}
                <div 
                  className="dropdown-item text-primary fw-medium bg-light d-flex justify-content-between align-items-center"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center" >
                    <i className="las la-key fs-18 me-2" />
                    {isSwitchOn ? 'Change PIN' : 'Set PIN'}
                  </div>
                  <div className="form-check form-switch text-black-50">
                    <input
                      type="checkbox"
                      className="form-check-input "
                      style={{
                        color:"blueviolet"
                      }}
                      checked={pinToggle}
                      onChange={async (e) => { // Corrected typo here
                        const isChecked = e.target.checked;
                        setPinToggle(isChecked);

                        if (isChecked) {
                          setShowPinModal(true);
                        } else {
                          const adminId = localStorage.getItem("adminDocId");
                          const employeeId = localStorage.getItem("EmployeeDocId");
                          const userIde = adminId || employeeId;
                          const Role = adminId ? "admin" : "employee";
                          const collectionPath = Role === "admin" ? "Admin" : "Users";

                          try {
                            await setDoc(doc(db, collectionPath, userIde), 
                              { 
                                isSwitchOn: false,
                                pin: null
                              }, 
                              { merge: true }
                            );
                            setIsPinSet(false);
                            localStorage.setItem('isSwitchOn', 'false');
                            Swal.fire({
                              position: "top-end",
                              icon: "success",
                              title: "Login PIN disabled",
                              showConfirmButton: false,
                              timer: 1500,
                              toast: true,
                              width: "250px",
                            });
                          } catch (error) {
                            console.error("Error updating pin status:", error);
                            setPinToggle(true);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                {/* <div className="dropdown-divider  my-2" /> */}
                <Link
                  className="dropdown-item text-primary bg-light fw-medium"
                  onClick={handleLogout}
                >
                  <i className="las la-power-off fs-18 me-2" /> Logout
                </Link>
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <PinSetupModal
        show={showPinModal}
        onHide={() => setShowPinModal(false)}
        onVerify={handlePinSet}
      />
    </div>
  );
}

export default Navbar;
