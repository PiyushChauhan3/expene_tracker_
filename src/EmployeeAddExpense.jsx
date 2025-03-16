import React, { useEffect, useState } from "react";
import { db, storage } from "./Firebase";
import {
  collection,
  addDoc, setDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Swal from "sweetalert2";



const EmployeeAddExpense = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState(""); // Default type
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [billPhoto, setBillPhoto] = useState(null);
  const [status , setStatus] = useState("pending");
  const [errors, setErrors] = useState({});

  const [loading,setLoading] = useState(false)
  const navigate = useNavigate();

  // Format time to "hh:mm AM/PM"
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
  };

  // Initialize time
  useEffect(() => {
    setTime(formatTime(new Date()));
  }, []);

  // Validation
  const validateInputs = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0)
      newErrors.amount = "Amount must be a positive number.";
    if (!date) newErrors.date = "Date is required.";
    if (!type) newErrors.type = "Type is required.";
    if (!category) newErrors.category = "Category is required.";
    if (remarks.length > 200)
      newErrors.remarks = "Remarks should not exceed 200 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true)

    // Validate inputs
    if (!validateInputs()) return;

    try {
      const adminDocId = localStorage.getItem("EmployeeDocId");
      if (!adminDocId) throw new Error("Please login again.");

      // Upload bill photo if provided
      let billPhotoUrl = null;
      if (billPhoto) {
        const storageRef = ref(
          storage,
          `Web Employees/${adminDocId}/${Date.now()}_${billPhoto.name}`
        );
        const uploadTask = await uploadBytes(storageRef, billPhoto);
        billPhotoUrl = await getDownloadURL(uploadTask.ref);
      }

      // Check if admin document exists
      const adminRef = doc(db, "Web Employees", adminDocId);
      const adminDoc = await getDoc(adminRef);
      if (!adminDoc.exists()) {
        Swal.fire("Error", "Admin document does not exist!", "error");
        return;
      }

      // Expense data to add
      const expenseData = {
        title,
        amount: parseFloat(amount),
        type,
        status,
        category,
        date,
        time,
        remarks,
        billPhoto: billPhotoUrl,
        createdAt: serverTimestamp(),
      };

      // Add expense to the sub-collection
      const expenseCollectionRef = collection(
        db,
        `Web Employees/${adminDocId}/Expenses`
      );
      const docRef = await addDoc(expenseCollectionRef, expenseData);

      // Success feedback
      Swal.fire("Success", "Expense added successfully!", "success");

      // Reset form fields
      setTitle("");
      setAmount("");
      setStatus("panding")
      setType("");
      setCategory("");
      setDate(new Date().toISOString().slice(0, 10));
      setRemarks("");
      setBillPhoto(null);
      setTime(formatTime(new Date()));

      // Navigate to expense list
      navigate("/Employee/ExpensesList");
    } catch (error) {
      console.error("Error adding expense:", error);
      Swal.fire("Error", error.message, "error");
    }finally{
      setLoading(false)
    }
  };

  // Handle file input change
  const handleFileChange = (e) => setBillPhoto(e.target.files[0]);

  return (
    <div>
         <div style={{ marginTop: "40px" }}>
        <div
          className=""
          style={{ marginLeft: "350px", width: "80vw" }}
        >
          <div className="page-title-box d-md-flex justify-content-md-between align-items-center">
            <h3 className="page-title text-dark">Employee Expenses</h3>
            <div className="">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="#" className="fs-5">
                    Expenses
                  </a>
                </li>
              
                <li className="breadcrumb-item active fs-5">Add Expemses</li>
              </ol>
            </div>
          </div>
        </div>

        <div
          style={{
            marginRight: "173px",
            marginBottom: "105px",
            marginLeft: "340.5px",
            marginTop: "20px",
          }}
        >
          <div className="container-fluid card shadow-lg px-3 py-3">
            <h4 style={{ fontSize: "18px", fontWeight: "700" }}>Add Expense</h4>
            <form onSubmit={handleSubmit}>
              <div className="d-flex" style={{ gap: "70px" }}>
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="title"
                    className="form-label"
                    style={{ fontSize: "18px" }}
                  >
                    Title
                  </label>
                  <input
                    style={{ width: "605px", height: "60px", fontSize: "18px" }}
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder=""
                  />
                  {errors.title && (
                    <div className="text-danger mt-1">{errors.title}</div>
                  )}
                </div>
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="amount"
                    className="form-label"
                    style={{ fontSize: "18px" }}
                  >
                    Amount
                  </label>
                  <input
                    style={{ width: "605px", height: "60px", fontSize: "18px" }}
                    type="number"
                    className="form-control"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  {errors.amount && (
                    <div className="text-danger mt-1">{errors.amount}</div>
                  )}
                </div>
              </div>
              <div className="d-flex" style={{ gap: "70px" }}>
                <div className="mb-2 mt-2">
                  <label className="mb-4" style={{ fontSize: "18px" }}>
                    Type
                  </label>
                  <div style={{ width: "605px" }}>
                    <label style={{ marginRight: "50px", fontSize: "18px" }}>
                      <input
                        style={{ marginRight: "5px" }}
                        type="radio"
                        value="debit"
                        checked={type === "debit"}
                        onChange={() => setType("debit")}
                      />{" "}
                      Debit
                    </label>
                    <label style={{ fontSize: "18px" }}>
                      <input
                        style={{ marginRight: "5px" }}
                        type="radio"
                        value="credit"
                        checked={type === "credit"}
                        onChange={() => setType("credit")}
                      />
                      Credit
                    </label>
                  </div>
                  {errors.type && (
                    <div className="text-danger mt-1">{errors.type}</div>
                  )}
                </div>
                <div className="mb-2 mt-2">
                  <label
                    htmlFor="category"
                    className="form-label mb-2"
                    style={{ fontSize: "18px" }}
                  >
                    Category
                  </label>
                  <select
                    style={{
                      width: "605px",
                      height: "60px",
                      fontSize: "15px",
                      color: category === "" ? "black" : "black",
                      fontWeight: category === "" ? "400" : "normal",
                    }}
                    className="form-select"
                    id="category"
                    value={category}
                    required
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {errors.category && (
                      <div className="text-danger mt-1">{errors.category}</div>
                    )}
                    <option value="" disabled>
                      -- Select a Category --
                    </option>
                    <option value="health">Expenses</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="entertainment">Health</option>
                  </select>
                </div>
              </div>
              <div className="d-flex" style={{ gap: "70px" }}>
                <div
                  className="mt-2"
                  style={{ width: "605px", height: "50px" }}
                >
                  <label
                    htmlFor="date"
                    className="form-label fs-5"
                    style={{ marginBottom: "15px", fontSize: "15px" }}
                  >
                    Date
                  </label>
                  <input
                    style={{ width: "605px", height: "60px", fontSize: "18px" }}
                    type="date"
                    className="form-control"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  {errors.date && (
                    <div className="text-danger mt-1">{errors.date}</div>
                  )}
                </div>
                <div
                  className="mb-3 mt-2"
                  style={{ width: "605px", height: "50px" }}
                >
                  <label
                    htmlFor="time"
                    className="form-label fs-5"
                    style={{ marginBottom: "15px", fontSize: "18px" }}
                  >
                    Time (Current: {time})
                  </label>
                  <input
                    style={{ width: "605px", height: "60px", fontSize: "18px" }}
                    type="text"
                    className="form-control"
                    id="time"
                    value={time}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 mt-4">
                <label
                  htmlFor="remarks"
                  className="form-label mb-2"
                  style={{ fontSize: "18px" }}
                >
                  Remarks
                </label>
                <textarea

                  className="form-control "
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  maxLength="200"
                 
                ></textarea>
                {errors.remarks && (
                  <div className="text-danger mt-1">{errors.remarks}</div>
                )}
              </div>
              <div className="mb-3 mt-2">
                <label
                  htmlFor="billPhoto"
                  className="form-label"
                  style={{ fontSize: "18px" }}
                >
                  Add Bill Photo
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="billPhoto"
                  onChange={handleFileChange}
                />
                {errors.billPhoto && (
                  <div className="text-danger mt-1">{errors.billPhoto}</div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-3"
                style={{ fontSize: "18px" }}
                disabled={loading}
              >
                  {loading ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></span>
                        Add Expense...
                      </span>
                    ) : (
                      "add Expense"
                    )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeAddExpense
