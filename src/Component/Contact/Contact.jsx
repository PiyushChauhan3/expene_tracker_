import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import background from "../../assets/bgc.jpg";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { db } from "../../Firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../AuthContext";
import './Contact.css?v=3.3.3'; // Add this import
import { FaPhoneAlt } from "react-icons/fa";

const Role = localStorage.getItem("Role");
const Contact = () => {
  const form = useRef(); // Reference for the form
  const {isSidebarVisible} = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    subject: "",
    message: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };
  const validateFields = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "username is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)
    ) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.subject) newErrors.subject = "Subject is required.";
    if (!formData.message) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateFields()) {
      setIsLoading(true); 
      emailjs
      .sendForm(
        // "service_dilpd7m", // Replace with your EmailJS service ID
        "service_qtaeys8",
        // "template_lz3qd0l", // Replace with your EmailJS template ID
        "template_jm1q2tc",
        form.current,
        // "EbnnO_Wm3w7K-ssWY" // Replace with your EmailJS public key
        "jeoU_vLay-zcX8BZp"

      )
      .then(
        () => {
        Swal.fire(
          "Success",
          "Message sent successfully!" +
          "<br>" +
          "Hr will contact you soon...!",
          "success"
        );
        setFormData({
          ...formData,
          subject: "",
          message: "",
        });
        },
        (error) => {
        console.error("Error sending email:", error.text);
        Swal.fire(
          "Error",
          "Failed to send message. Please try again.",
          "error"
        );
        }
      )
      .finally(() => {
        setIsLoading(false); // Hide loading spinner
      });
    }
  };

  useEffect(() => {
    setFormData({
      username: "",
      email: "",
      subject: "",
      message: "",
      image: "",
    });
    setErrors({});

    const fetchAdminData = () => {
      const adminDocId = localStorage.getItem("adminDocId");
      const employeeDocId = localStorage.getItem("EmployeeDocId");

      const docId = adminDocId || employeeDocId;

      if (!docId) {
        Swal.fire(
          "Error",
          "No admin or employee ID found. Please log in.",
          "error"
        );
        navigate("/");
        return;
      }

      let unsubscribe; // For cleaning up the listener

      const setupRealtimeListener = () => {
        let userData = null;

        // Choose collection based on whether the user is admin or employee
        const collection = adminDocId ? "Admin" : "Users";
        const docRef = doc(db, collection, docId);

        unsubscribe = onSnapshot(docRef, async (snapshot) => {
          if (snapshot.exists()) {
            // Fetch the user data from Firestore snapshot
            userData = snapshot.data();

            try {
              const storage = getStorage();
              const profileImageRef = ref(storage, `profile_images/${docId}`);
              const profileImageUrl = await getDownloadURL(profileImageRef);

              setFormData({
                ...userData,
                username: userData.username || "",
                email: userData.email || "",
                image: profileImageUrl || "", // Set image or fallback to empty string
              });
            } catch (error) {
              console.warn("Profile image not found", error.message);
              setFormData({
                ...userData,
                username: userData.username || "",
                email: userData.email || "",
                image: "", // Set empty string if image is not found
              });
            }
          } else {
            console.warn("Document does not exist.");
          }
        });
      };

      setupRealtimeListener();

      // Clean up the listener when the component unmounts or if docId changes
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    };

    fetchAdminData();
  }, [navigate]);
  return (
    <div className={`contact-wrapper ${isSidebarVisible ? "sidebar-open" : " "}`}>
      <div className="page-header-container">
        <div
          className="container-fluid page-header py-5 wow fadeIn"
          style={{
            backgroundImage: `url(${background})`,
          }}
        >
          <div className="container text-end py-5">
            <h1 className="responsive-title text-dark mb-4">Contact Us</h1>
          </div>
        </div>
      </div>

      <div
        style={{
        
        }}
        className="contact-content py-2"
      >
        <div className="container">
          <div className="text-center mx-auto wow fadeInUp mb-4">
            <h2 className="section-title">Send us an email!</h2>
          </div>

          <form ref={form} onSubmit={handleSubmit}>
            <div className="row ">
              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-floating">
                      {Role === "admin" && (
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            errors.username ? "is-invalid" : ""
                          }`}
                          id="username"
                          name="from_name"
                          placeholder="Your username"
                          value={formData.username}
                          onChange={handleInputChange}
                          
                        />
                      )}
                      {Role === "employee" && (
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            errors.username ? "is-invalid" : ""
                          }`}
                          id="username"
                          name="from_name"
                          placeholder="Your username"
                          value={formData.username}
                          onChange={handleInputChange}
                          
                        />
                      )}
                      <label htmlFor="username">Your username</label>
                      {errors.username && (
                        <div className="invalid-feedback">{errors.username}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-floating">
                      {Role === "admin" && (
                        <input
                          type="email"
                          className={`form-control form-control-sm ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          id="email"
                          name="user_email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          
                        />
                      )}
                      {Role === "employee" && (
                        <input
                          type="email"
                          className={`form-control form-control-sm ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          id="email"
                          name="user_email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          
                        />
                      )}
                      <label htmlFor="email">Your Email</label>
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        className={`form-control form-control-sm ${
                          errors.subject ? "is-invalid" : ""
                        }`}
                        id="subject"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="subject">Subject</label>
                      {errors.subject && (
                        <div className="invalid-feedback">
                          {errors.subject}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating ">
                      <textarea
                        className={`form-control form-control-sm ${
                          errors.message ? "is-invalid" : ""
                        }`}
                        placeholder="Leave a message here"
                        type="textarea"
                        id="message"
                        name="message"
                        style={{ height: "100px" }}
                        value={formData.message}
                        onChange={handleInputChange}
                       
                      />
                      <label
                        htmlFor="message"
                        style={{
                          transform: formData.message ? "scale(0.75) translateY(-1.5rem)" : "scale(1) translateY(-0.35rem)",
                          transition: "transform 0.2s ease-in-out",
                        }}
                      >
                        Message
                      </label>
                      {errors.message && (
                        <div className="invalid-feedback">
                          {errors.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-primary rounded-pill py-3 px-5"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="contact-info">
                  <h3 className="contact-info-title">Contact Details</h3>
                  <div className="contact-detail-item">
                    <div className="icon-box">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="detail-content">
                      <h6 className="detail-title">Our Office</h6>
                      <span className="detail-text">347, Marvella Corridors Complex, Vesu Surat - 395007 Gujarat, IN</span>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <div className="icon-box">
                    <FaPhoneAlt />
                    </div>
                    <div className="detail-content">
                      <h6 className="detail-title">Call Us</h6>
                      <span className="detail-text">+91 76000 15403</span>
                    </div>
                  </div>
                  <div className="contact-detail-item">
                    <div className="icon-box">
                      <i className="fa fa-envelope"></i>
                    </div>
                    <div className="detail-content">
                      <h6 className="detail-title">Mail Us</h6>
                      <span className="detail-text">generation.next@live.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <iframe
                  className="map-frame"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5262.611472417134!2d72.79097815335717!3d21.143312561173108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04e730b01b80f%3A0xff8437019c9fed20!2sGeneration%20Next%20-%20Web%20Design%2C%20Mobile%20Apps%2C%20SEO%20Services!5e0!3m2!1sen!2sin!4v1704351145400!5m2!1sen!2sin"
                  frameBorder={0}
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex={0}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
