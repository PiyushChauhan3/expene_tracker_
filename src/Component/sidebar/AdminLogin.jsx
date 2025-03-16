import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc, getDocs, query, collection, where }from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase";
import { useAuth } from "../../AuthContext";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import '../../styles/AdminLogin.css';
import Swal from 'sweetalert2';
import PinSetupModal from './PinSetupModal';
import PinVerificationModal from './PinVerificationModal';
import DefaultImage from '../../assets/images/default-profile.png';

const Login = () => {
  const navigate = useNavigate();
  useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [local] = useState("local");
  const [loginError, setLoginError] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const direct = localStorage.getItem("adminId");
    const employee = localStorage.getItem("employee");
    if(direct){
      navigate("/dashboard")
    } else if (employee){
      navigate("/dashboard")
    } else {
      navigate("/login_signup_page");
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setLoginError(""); // Clear any previous errors

    try {
      // First check if user exists in Admin collection
      const adminQuerySnapshot = await getDocs(
        query(collection(db, "Admin"), where("email", "==", email))
      );

      if (adminQuerySnapshot.empty) {
        setLoginError("No admin account found with this email.");
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        const adminRef = doc(db, "Admin", user.uid);
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists()) {
          const adminData = adminDoc.data();
          
          // Fetch profile image
          setProfileImage(adminData.profileImageUrl || DefaultImage); 
          
          // Check if PIN is set
          if (adminData.isSwitchOn === true) {
            setShowPinVerification(true);
          } else {
            navigate("/dashboard");}
          
          // Store necessary data
          localStorage.setItem("adminDocId", adminData?.authUid || user.uid);
          localStorage.setItem("Role", adminData?.role || "");
          localStorage.setItem("isSwitchOn", adminData?.isSwitchOn || false);
          // localStorage.setItem("username", adminData?.username || "");
          // localStorage.setItem("email", adminData?.email || "");
          
          // Don't navigate yet - wait for PIN verification
          setIsLoading(false);
        }
      }
    } catch (error) {
      // console.log("Firebase error code:", error.code); // Debugging line
      
      switch (error.code) {
        case 'auth/wrong-password':
          setLoginError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-credential':
          setLoginError("Invalid email or password. Please check your credentials.");
          break;
        case 'auth/too-many-requests':
          setLoginError("Too many failed login attempts. Please try again later.");
          break;
        case 'auth/user-disabled':
          setLoginError("This account has been disabled. Please contact support.");
          break;
        case 'auth/network-request-failed':
          setLoginError("Network error. Please check your internet connection.");
          break;
        default:
          setLoginError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinVerification = async (pin) => {
    const adminId = localStorage.getItem("adminDocId");
    const adminRef = doc(db, "Admin", adminId);
    const adminDoc = await getDoc(adminRef);
    
    if (adminDoc.data()?.pin === pin) {
      setShowPinVerification(false);
      navigate("/dashboard");
      
      await Swal.fire({
        title: "Login successful",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      setErrors({ pin: "Incorrect PIN. Please try again." });
    }
  };

  return (
    <>
    <div className="admin-login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="form-container">
            {/* {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
              </div>
            )} */}
            <form onSubmit={handleLogin}>
              <div className="admin-form-group">
                <label className="form-label " htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-input"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                {errors.email && <div className="error-text">{errors.email}</div>}
              </div>
              <div className="admin-form-group"> 
                <label className="form-label" htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <span 
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </span>
                </div>
                {loginError && <p className="error-message">{loginError}</p>}
              </div>
              <div className="d-flex justify-content-end mb-3">
                <Link to="/forget" className="text-primary">Forgot password?</Link>
              </div>
              <button 
                className="submit-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>Log In <i className="fas fa-sign-in-alt " /></>
                )}
              </button>
            </form>
            <div className="text-center mt-3">
              <p className="footer-texts">
                Don&apos;t have an account?{" "}
                <Link to="/adminregister" className="text-primary">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
   
    <PinSetupModal
      show={showPinSetup}
      onHide={() => setShowPinSetup(false)}
      userId={localStorage.getItem("adminDocId")}
      onSuccess={() => {
        navigate("/dashboard");
        setShowPinSetup(false);
      }}
      profileImage={profileImage}
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

export default Login;

