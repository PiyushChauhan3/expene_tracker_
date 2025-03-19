import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Firebase";
import { useAuth } from "../../../AuthContext";
import "./Dashboard.css";
import DefaultBillImage from "../../../bill-def-img.png";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  const monthNames = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    if (selectedMonth === 0) {
      setFilteredExpenses(expenses);
      calculateTotals(expenses);
    } else {
      filterExpenses(expenses, selectedMonth);
    }
  }, [selectedMonth, expenses]);

  

  const { isSidebarVisible } = useAuth();
  const role = localStorage.getItem("Role");

  useEffect(() => {
    const fetchExpenses = async () => {
      const role = localStorage.getItem("Role");
      const userId = localStorage.getItem(role === "admin" ? "adminDocId" : "EmployeeDocId");

      if (!userId) {
        console.error("User ID is missing from localStorage.");
        return;
      }

      try {
        const collectionPath = role === "admin"
          ? `Admin/${userId}/expense`
          : `Users/${userId}/expense`;

        const querySnapshot = await getDocs(collection(db, collectionPath));
        
        if (!querySnapshot.empty) {
          const expenseList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // For employees, only show approved expenses
          const filteredList = role === "admin"
            ? expenseList
            : expenseList.filter((expense) => expense.status.toLowerCase() === "approved".toLowerCase());

          // Sort expenses by date in descending order
          filteredList.sort((a, b) => new Date(b.date) - new Date(a.date));

          setExpenses(filteredList);
          setSelectedMonth(new Date().getMonth() + 1); // Set current month
          filterExpenses(filteredList, new Date().getMonth() + 1); // Filter by current month
        } else {
          // console.log("No expenses found.");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load expenses. Please try again.",
          icon: "error",
        });
      }
    };

    fetchExpenses();
  }, []);

  const filterExpenses = (data, month) => {
    const filtered = month === 0 ? data : data.filter(
      (expense) => new Date(expense.date).getMonth() + 1 === month
    );
    // console.log("Filtered expenses for month:", filtered);
    setFilteredExpenses(filtered);
    calculateTotals(filtered);
  };

  const calculateTotals = (data) => {
    const credit = data
      .filter((expense) => expense.transactionType === "credit")
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const debit = data
      .filter((expense) => expense.transactionType === "debit")
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    // console.log("Total credit:", credit);
    // console.log("Total debit:", debit);
    setTotalCredit(credit);
    setTotalDebit(debit);
  };

  const handleMonthChange = (event) => {
    const monthIndex = parseInt(event.target.value);
    setSelectedMonth(monthIndex);
    filterExpenses(expenses, monthIndex);
  };

  const handleTransactionClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setIsImageModalOpen(true);
    setIsModalOpen(false);
  };

  const closeModal = () => setIsImageModalOpen(null);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = Array.from(
    { length: Math.ceil(filteredExpenses.length / itemsPerPage) },
    (_, i) => i + 1
  );

  return (
<div className={`container-larger dashboard-container ${isSidebarVisible ? "sidebar-open" : ""}`}>
<div className="dashboard-wrapper py-4">
        <h1 className="dashboard-title">Dashboard : {monthNames[selectedMonth]}</h1>

        <div className="row g-4">
          <div className="summary-cards-wrapper">
            <div className="summary-card credit">
              <div className="card-body das text-center">
                <h5>Total Credit</h5>
                <p className="amount">{formatAmount(totalCredit)}</p>
              </div>
            </div>

            <div className="summary-card debit">
              <div className="card-body das text-center">
                <h5>Total Debit</h5>
                <p className="amount">{formatAmount(totalDebit)}</p>
              </div>
            </div>
          </div>

         { /* Transactions Section */}
          <div className="col-12">
            <div className="transactions-card">
              <div className="card-body das">
                <div className="transactions-header">
                  <h5>Recent Transactions</h5>
                  <div className="month-selector">
                    <label>Select Month: </label>
                    <select value={selectedMonth} onChange={handleMonthChange}>
                      {monthNames.map((month, index) => (
                        <option key={index} value={index}>{month}</option>
                      ))}
                    </select>
                    {/* <select>
                      <option value="all">All</option>
                      {Array.from(new Set(expenses.map(expense => new Date(expense.date).getFullYear()))).map((year, index) => (
                        <option key={index} value={year}>{year}</option>
                      ))}
                    </select> */}
                  </div>
                </div>

                <div className="transaction-list">
                  {currentExpenses.length > 0 ? (
                    currentExpenses
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((expense, index) => (
                        <div
                          key={index}
                          onClick={() => handleTransactionClick(expense)}
                          className="transaction-item"
                        >
                          <div className="transaction-details">
                            <div className="transaction-info">
                              <h6>{expense.title}</h6>
                              <p className="category">
                                <span className="label">Category:</span> {expense.category}
                              </p>
                              <small className="date">
                                {new Date(expense.date).toLocaleDateString("en-GB")} {expense.time}
                              </small>
                            </div>
                            {role === "employee" ? (
                              <div className="">
                                <div className={`transaction-amount ${expense.transactionType}`}>
                                  <span>{formatAmount(expense.amount)}</span>
                                  <small>{expense.transactionType === "debit" ? "Dr" : "Cr"}</small>
                                </div>
                                <div
                                  className={`status-badge ${expense.status.toLowerCase()}`}
                                  style={{
                                    background: expense.status.toLowerCase() === "approved" ? "green" : "red",
                                    color: expense.status.toLowerCase() === "approved" ? "white" : "black",
                                  }}
                                >
                                  {expense.status}
                                </div>
                              </div>
                            ) : (
                              <div className={`transaction-amount ${expense.transactionType}`}>
                                <span>{formatAmount(expense.amount)}</span>
                                <small>{expense.transactionType === "debit" ? "Dr" : "Cr"}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ textAlign: "center", margin: "50px 0" }}>
                      <img
                        src="https://indiaai.gov.in/indiaAi-2021/build/images/Listing-page/gif/no-result.gif"
                        alt="No results"
                        style={{ maxWidth: "150px", marginBottom: "0px" }}
                      />
                      <h4>No Results Found</h4>
                      <p>Try adjusting your search to find what you&apos;re looking for.</p>
                    </div>
                  )}
                </div>
                <div className="pagination-container" style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {currentPage > 6 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {pageNumbers.slice(Math.max(0, currentPage - 3), Math.min(pageNumbers.length, currentPage + 2)).map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                        <button className="page-link" onClick={() => paginate(number)}>
                          {number}
                        </button>
                      </li>
                    ))}
                    {currentPage < pageNumbers.length - 4 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${currentPage === pageNumbers.length ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === pageNumbers.length}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {isModalOpen && selectedExpense && (
            <div
              className="modal mt-0 modal-dashboard"
              style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content col">
              <div className="modal-header">
                <h5 className="modal-title">Expense Details</h5>
                <button
              type="button"
              className="close-button"
              onClick={() => setIsModalOpen(false)}
                >
              &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="expense-details d-flex justify-content-between align-items-center text-dark">
              {selectedExpense.imageUrl && (
                <div className="modal-res1 col-md-6 text-center">
                  <img
                src={selectedExpense.imageUrl}
                onClick={() => handleImageClick(selectedExpense.imageUrl)}
                alt="Bill"
                style={{ maxWidth: "70%" }}
                className="img-fluid"
                  />
                </div>
              )}
              <div
                className={`modal-res ${
                  selectedExpense.imageUrl ? "col-md-6" : "col-md-12"
                }`}
              >
                <div className="detail-row">
                  <strong>Title:</strong> {selectedExpense.title}
                </div>
                <div className="detail-row">
                  <strong>Amount:</strong> {formatAmount(selectedExpense.amount)}
                </div>
                <div className="detail-row">
                  <strong>Type:</strong> {selectedExpense.transactionType}
                </div>
                <div className="detail-row">
                  <strong>Category:</strong> {selectedExpense.category}
                </div>
                <div className="detail-row">
                  <strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString("en-GB")}
                </div>
                <div className="detail-row">
                  <strong>Time:</strong> {selectedExpense.time}
                </div>
                {selectedExpense.remark && (
                  <div className="detail-row">
                <strong>Remark:</strong> {selectedExpense.remark}
                  </div>
                )}
              </div>
                </div>
              </div>
              
            </div>
              </div>
            </div>
          )}

      {/* {isModalOpen && selectedExpense && (
        <div className="modal-overlay mt-0 " onClick={() => setIsModalOpen(false)}>
          <div className="modal-content col" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-group">
                <div className="detail-row ">
                  <span className="label">Bill Image</span>
                  <span  className="value">
                    {selectedExpense.imageUrl ? (
                      <img src={selectedExpense.imageUrl}
                      alt="Bill" height="150" width="150" onClick={() => handleImageClick(selectedExpense.imageUrl)} style={{ cursor: "pointer" }} />
                    ) : (
                      <img src={DefaultBillImage} alt="Bill" height="150" width="150"  style={{ cursor: "pointer" }} />
                    )}
                  </span>
                </div>  
                <div className="detail-row">
                  <span className="label">Title</span>
                  <span className="value">{selectedExpense.title}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount</span>
                  <span className={`value ${selectedExpense.transactionType}`}>
                    {formatAmount(selectedExpense.amount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Type</span>
                  <span className="value type-badge">{selectedExpense.transactionType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Category</span>
                  <span className="value">{selectedExpense.category}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date & Time</span>
                  <span className="value">
                    {new Date(selectedExpense.date).toLocaleDateString("en-GB")} {selectedExpense.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
        className="modal mt-0"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onClick={closeModal}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: "90%",display:"flex", justifyContent:"center"}}
        >
          <div className="modal-content">
            <div className="modal-body text-center ">
              <img
                src={selectedExpense.imageUrl}
                alt="Bill"
                className="img-fluid"
                style={{ maxWidth: "100%" }}
                width={1000}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
      </div>
    </div>
  </div>
  );
};

export default Dashboard;