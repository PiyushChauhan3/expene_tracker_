import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./styles/Forget.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const checkEmail = async (email) => {
    const db = getFirestore();
    try {
      // Check in Admin collection
      const adminDoc = await getDoc(doc(db, "Admin", email));
      if (adminDoc.exists()) {
        return { exists: true, isAdmin: true };
      }

      // Check in Users collection
      const userDoc = await getDoc(doc(db, "Users", email));
      if (userDoc.exists()) {
        return { exists: true, isAdmin: false };
      }

      return { exists: false, isAdmin: false };
    } catch (error) {
      console.error("Error checking email:", error);
      return { exists: false, isAdmin: false };
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const auth = getAuth();

    try {
      const emailStatus = await checkEmail(email);
      
      if (!emailStatus.exists) {
        setMessage({ type: "error", text: "Email not found in our database." });
        setIsLoading(false);
        return;
      }

      if (!emailStatus.isAdmin) {
        setMessage({ type: "error", text: "Password reset is only available for admin accounts. Please contact your administrator." });
        setIsLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage({ type: "success", text: "Password reset email sent! Check your inbox." });
      setEmail("");
    } catch (error) {
      console.error("Error:", error.message);
      setMessage({ type: "error", text: "Error sending email. Please try again." });
    }
    setIsLoading(false);
  };

  return (
    <div className="forgot-password-container ">
      <div className="row  d-flex justify-content-center">
        <div className="col-12 align-self-center">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-5 mx-auto">
                <div className="card forgot-password-card">
                  <div className="card-body p-0 card-header forgot-password-header rounded-top">
                    <div className="text-center p-3">
                      <h4 className="mt-3 mb-1 fw-semibold fs-18">
                        Reset Password
                      </h4>
                      <p className="text-muted fw-medium mb-0">
                        Enter your Email and instructions will be sent to you!
                      </p>
                    </div>
                  </div>
                  <div className="card-body pt-0">
                    <form className="my-4" onSubmit={handlePasswordReset}>
                      <div className="form-group mb-2">
                        <label className="form-label" htmlFor="userEmail">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control forgot-password-input"
                          id="userEmail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter Email Address"
                          required
                        />
                      </div>
                      <div className="form-group mb-0">
                        <button 
                          className={`btn btn-primary forgot-password-button ${isLoading ? 'disabled' : ''}`}
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Sending...' : 'Send Reset Email'}
                        </button>
                      </div>
                    </form>
                    
                    {message && (
                      <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} text-center`}>
                        {message.text}
                      </div>
                    )}

                    <div className="text-center mb-2">
                      <p className="text-muted">
                        Remember your password?{" "}
                        <Link to="/" className="text-primary">
                          Login
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
