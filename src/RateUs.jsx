import { useState, useEffect } from "react";
import { db } from "./Firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import DefaultImage from "./team-member.jpg";
import { useAuth } from "./AuthContext";
import "./styles/RateUs.css?v=1.0.1";

const RateUs = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: "",
    text: "",
    rating: 0,
    profileImage: "",
  });
  const [error, setError] = useState("");
  const [displayCount, setDisplayCount] = useState(5); // Tracks how many reviews to display
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Loading state component
  const LoadingSpinner = () => (
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
  );

  // Fetch Admin Data
  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      const role = localStorage.getItem("Role");
      if (!role) {
        console.error("Role is null");
        return;
      }
      const adminDocId = localStorage.getItem(
        role === "admin" ? "adminDocId" : "EmployeeDocId"
      );
      if (!adminDocId) {
        console.error("AdminDocId is null");
        return;
      }

      try {
        const adminDocRef = doc(
          db,
          role === "admin" ? "Admin" : "Users",
          adminDocId
        );

        const adminSnap = await getDoc(adminDocRef);

        if (adminSnap.exists()) {
          const adminData = adminSnap.data();
          setNewReview((prevData) => ({
            ...prevData,
            name: adminData.username || "",
            profileImage: role === "admin" ? adminData.company_logo || DefaultImage : adminData.employee_logo || DefaultImage,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(error.message || "Something went wrong.");
      }
      setIsLoading(false);
    };

    fetchAdminData();
  }, [navigate]);

  // Fetch reviews
  useEffect(() => {
    const q = query(collection(db, "Reviews"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReviews = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort reviews by createdAt in descending order
      const sortedReviews = fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0); // Default to epoch time if missing
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeB - timeA; // Descending order
      });

      setReviews(sortedReviews); // Set the sorted reviews
    });

    return () => unsubscribe();
  }, []);

  const handleAddReview = async () => {
    if (
      !newReview.text.trim() ||
      !newReview.name.trim() ||
      newReview.rating === 0
    ) {
      setError("Please fill all fields and select a rating.");
      return;
    }

    try {
      await addDoc(collection(db, "Reviews"), {
        ...newReview,
        createdAt: serverTimestamp(), // Add server timestamp
      });

      setNewReview({ ...newReview, text: "", rating: 0 }); // Reset form
      setError(""); // Clear error
    } catch {
      setError("There was an error submitting your review.");
    }
  };

  const handleStarClick = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const loadMoreReviews = () => {
    setDisplayCount((prevCount) => prevCount + 5); // Increment display count by 5
  };

  const hideAllReviews = () => {
    setDisplayCount(5); // Reset display count to hide all reviews
  };

  const { isSidebarVisible } = useAuth();

  return (
    <div className={`container-larger rate-us-container ${isSidebarVisible ? "sidebar-open" : ""}`}>
      <div className="rate-us-header">
        <div className="page-title-box">
          <h2 className="page-title">Rate Us</h2>
          <nav className="breadcrumb-nav">
            <Link to="/editprofile" className="breadcrumb-link">Profile</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Rate Us</span>
          </nav>
        </div>
      </div>

      <div className="add-review-container shadow-lg">
        <h3 className="section-title">Share Your Experience</h3>
        {error && <div className="error-message">{error}</div>}
        
        <div className="review-form">
          <div className="rating-section">
            <label className="rating-label">Your Rating</label>
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`star-button ${newReview.rating > index ? "star-selected" : "star"}`}
                  onClick={() => handleStarClick(index + 1)}
                  aria-label={`Rate ${index + 1} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <input
              type="text"
              value={newReview.name}
              readOnly
              className="input-field"
              placeholder="Your Name"
            />
          </div>

          <div className="form-group">
            <textarea
              value={newReview.text}
              onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
              className="textarea-field"
              placeholder="What did you like or dislike?"
            />
          </div>

          <button 
            onClick={handleAddReview}
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h3 className="section-title">Customer Reviews</h3>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="reviews-container ">
            {reviews.slice(0, displayCount).map((review) => (
              <div key={review.id} className="review-card shadow-lg">
                <div className="review-header">
                  <img
                    src={review.profileImage || DefaultImage}
                    alt={review.name}
                    className="avatar"
                    onError={(e) => { e.target.src = DefaultImage }}
                  />
                  <div className="review-meta">
                    <strong className="reviewer-name">{review.name}</strong>
                    <div className="rating-stars" title={`Rated ${review.rating} stars`} aria-label={`Rated ${review.rating} stars`} 
                    style={{ display: 'flex', gap: '0.25rem', color: '#f8d64e' }}>
                    
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>
                          {i < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
                <time className="review-date">
                  {review.createdAt?.toDate?.().toLocaleDateString()}&nbsp;at&nbsp;
                  {review.createdAt?.toDate?.().toLocaleTimeString()}
                </time>
              </div>
            ))}
          </div>
        )}

        <div className="review-actions">
          {displayCount < reviews.length && (
            <button onClick={loadMoreReviews} className="show-more-button">
              Show More Reviews ({reviews.length - displayCount} remaining)
            </button>
          )}
          {displayCount > 5 && (
            <button onClick={hideAllReviews} className="hide-reviews-button">
              Show Less
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateUs;
