import { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";
import "./styles/Add_Expenses.css?v=1.0.2"
// import axios from "axios"; // Import axios for Cloudinary

const AddExpenses = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionType, setType] = useState("");
  const [category, setCategory] = useState("");
  const [payment_mode, setPaymentMode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [remark, setRemarks] = useState("");
  const [imageUrl, setBillPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isSidebarVisible } = useAuth();
  const role = localStorage.getItem("Role"); // "admin" or "employee"

  useEffect(() => {
    const now = new Date();
    setTime(formatTime(now));
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = "Amount must be a positive number.";
    if (!date) newErrors.date = "Date is required.";
    if (!transactionType) newErrors.transactionType = "Type is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!payment_mode) newErrors.payment_mode = "Payment Mode is required.";
    if (remark.length > 200) newErrors.remark = "remark should not exceed 200 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const userId = localStorage.getItem(role === "admin" ? "adminDocId" : "EmployeeDocId");
      if (!userId) {
        throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} ID not found. Please login again.`);
      }

      let billPhotoUrl = null;
      if (imageUrl) {
        const cloudinaryUrl = "https://api.cloudinary.com/v1_1/due0loh2v/image/upload";
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", imageUrl);
        cloudinaryData.append("upload_preset", "ml_default"); 
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
        billPhotoUrl = data.secure_url;
      }

      const userRef = doc(db, role === "admin" ? "Admin" : "Users", userId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error(`${role.charAt(0).toUpperCase() + role.slice(1)} document does not exist.`);
      }

      const expenseData = {
        title,
        amount: parseFloat(amount),
        transactionType,
        category,
        payment_mode,
        date,
        time,
        remark,
        imageUrl: billPhotoUrl,
        createdAt: serverTimestamp(),
        status: role === "employee" ? "pending" : "approved",
      };

      const expenseCollectionRef = collection(
        db,
        `${role === "admin" ? "Admin" : "Users"}/${userId}/expense`
      );
      await addDoc(expenseCollectionRef, expenseData);

      resetForm();
      navigate(role === "admin" ? "/expense_list" : "/EmployeeExpensesList");
    } catch (error) {
      console.error("Error adding expense:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setType("");
    setCategory("");
    setPaymentMode("");
    setDate(new Date().toISOString().slice(0, 10));
    setRemarks("");
    setBillPhoto(null);
    setTime(formatTime(new Date()));
  };

  const handleFileChange = (e) => {
    setBillPhoto(e.target.files[0]);
  };

  return (
    <div className={`container-larger add-exp-container ${isSidebarVisible ? "sidebar-open" : " "}`}>
      <div className="content py-2">
        <div className="headers">
          <div className="page-title-box">
            <h3 className="page-title fs-4 mb-0">Expenses</h3>
            <div>
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to={role === "admin" ? "/expense_list" : "/employee/expenses"} className="fs-6">
                    Expenses
                  </Link>
                </li>
                <li className="breadcrumb-item active fs-6">Add Expenses</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="form-containers">
          <div className="card shadow">
            <div className="card-header py-3">
              <h4 className="card-title fs-5 mb-0">Add Expense</h4>
              {role === "employee" && (
                <div className="text-info mt-2 fs-6">
                  Note: Expenses need to be approved by an administrator
                </div>
              )}
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="form-field">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-controlss"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    {errors.title && <div className="text-danger mt-1">{errors.title}</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="amount" className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-controlss"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    {errors.amount && <div className="text-danger mt-1">{errors.amount}</div>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">Type</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          value="debit"
                          checked={transactionType === "debit"}
                          onChange={() => setType("debit")}
                        /> Debit
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="credit"
                          checked={transactionType === "credit"}
                          onChange={() => setType("credit")}
                        /> Credit
                      </label>
                    </div>
                    {errors.transactionType && <div className="text-danger mt-1">{errors.transactionType}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-field">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      value={category}
                      required
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="" disabled>-- Select a Category --</option>
                      <option value="transporataion">Transporataion</option>
                      <option value="food">Food</option>
                      <option value="fuel">Fuel</option>
                      <option value="clothing">Clothing</option>
                      <option value="travel">Travel</option>
                      <option value="other income">Other Income</option>
                      <option value="hkmaterial">H.K. Material</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="bonus">Bonus</option>
                      <option value="salary">Salary</option>
                      <option value="charitablegiving">Charitable Giving</option>
                      <option value="allowance">Allowance</option>
                      <option value="business">Business</option>
                      <option value="subscription/strimingservices">Subscription/Streaming Services</option>
                      <option value="veg">Veg</option>
                      <option value="foodexpenses">Food expenses</option>
                      <option value="investmentincome">Investment Income</option>
                      <option value="gifts">Gifts</option>
                      <option value="pension">Pension</option>
                    </select>
                    {errors.category && <div className="text-danger mt-1">{errors.category}</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="PaymentMode" className="form-label">Payment Mode</label>
                    <select
                      className="form-select"
                      id="PaymentMode"
                      value={payment_mode}
                      required
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option value="" disabled>-- Select a Payment Mode --</option>
                      <option value="cash">Cash</option>
                      <option value="net banking">Net Banking</option>
                      <option value="upi">UPI</option>
                    </select>
                    {errors.payment_mode && <div className="text-danger mt-1">{errors.payment_mode}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-field">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-controlss"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                    {errors.date && <div className="text-danger mt-1">{errors.date}</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="time" className="form-label">Time (Current: {time})</label>
                    <input
                      type="text"
                      className="form-controlss"
                      id="time"
                      value={time}
                      readOnly
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="form-field">
                    <label htmlFor="remark" className="form-label">Remark</label>
                    <input
                      className="form-controlss"
                      id="remark"
                      value={remark}
                      onChange={(e) => setRemarks(e.target.value)}
                      maxLength="200"
                    />
                    {errors.remark && <div className="text-danger mt-1">{errors.remark}</div>}
                  </div>
                  <div className="form-field">
                    <label htmlFor="billPhoto" className="form-label">Add Bill Photo</label>
                    <input
                      type="file"
                      className="form-controlss"
                      id="billPhoto"
                      onChange={handleFileChange}
                    />
                    {errors.imageUrl && <div className="text-danger mt-1">{errors.imageUrl}</div>}
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Add Expense...
                    </span>
                  ) : (
                    "Add Expense"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenses;
