import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Changed useHistory to useNavigate
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { FaXmark } from "react-icons/fa6";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import "./styles/EmployeeExpense.css?v=10";
import LoadingSpinner from "./Component/LoadingSpinner";
import { IoMdArrowRoundBack, IoMdCheckmark } from "react-icons/io";
import { FaCheck, FaCheckDouble, FaEye } from "react-icons/fa";
import DefaultBillImage from "./bill-def-img.png";
import { CgProfile } from "react-icons/cg";

import { useAuth } from "./AuthContext";
import { IoFilterSharp } from "react-icons/io5";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const EmployeeExpense = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate(); // Changed useHistory to useNavigate
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // added loading state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewExpense, setSelectedViewExpense] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [employee, setEmployee] = useState({});
  const [profileView, setProfileView] = useState();
  const [filterexp, setFilterexp] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const closeModal = () => setSelectedImage(null);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowViewModal(false);
    setProfileView(false);
  };

  useEffect(() => {
    if (!employeeId) {
      console.error("employeeId is undefined");
      setError("Employee ID is missing. Please check the URL.");
      setLoading(false);
      return;
    }

    const fetchEmployeeDetails = async () => {
      try {
        const employeeDoc = await getDoc(doc(db, "Users", employeeId));
        if (employeeDoc.exists()) {
          setEmployee(employeeDoc.data());
        } else {
          console.error("No such employee!");
        }
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError("");

        const collectionPath = `Users/${employeeId}/expense`;
        const expensesRef = collection(db, collectionPath);
        const expensesSnapshot = await getDocs(expensesRef);

        if (expensesSnapshot.empty) {
          // console.warn("No expense found for employeeId:", employeeId);
        }
        let expensesList = expensesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExpenses(expensesList);
      } catch (error) {
        console.error("Error fetching expense:", error);
        setError("Failed to fetch expense. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
    fetchExpenses();
  }, [employeeId]);

  const filteredExpenses = () => {
    let expensesList = [...expenses];

    if (fromDate) {
      expensesList = expensesList.filter(
        (expense) => new Date(expense.date) >= new Date(fromDate)
      );
    }

    if (toDate) {
      expensesList = expensesList.filter(
        (expense) => new Date(expense.date) <= new Date(toDate)
      );
    }

    if (filterStatus !== "all") {
      expensesList = expensesList.filter(
        (expense) => expense.status?.toLowerCase() === filterStatus
      );
    }

    return expensesList;
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allExpenseIds = expenses.map((expense) => expense.id);
      setSelectedExpenses(allExpenseIds);
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleCheckboxChange = (expenseId, isChecked) => {
    setSelectedExpenses((prevSelectedExpenses) => {
      if (isChecked) {
        return [...prevSelectedExpenses, expenseId];
      } else {
        return prevSelectedExpenses.filter((id) => id !== expenseId);
      }
    });
  };

  const handleBatchExpenseStatusChange = async (status) => {
    try {
      for (const expenseId of selectedExpenses) {
        await handleExpenseStatusChange(expenseId, status);
      }
      setSelectedExpenses([]);
    } catch (error) {
      console.error(`Error updating batch expenses to ${status}:`, error);
    }
  };

  const handleViewClick = (expense) => {
    setSelectedViewExpense(expense);
    setShowViewModal(true);
  };

  const handleExpenseStatusChange = async (expenseId, status) => {
    const updatedExpense = expenses.find((expense) => expense.id === expenseId);
    if (!updatedExpense) return;

    try {
      const expenseDoc = doc(
        db,
        `Users/${employeeId}/expense`,
        updatedExpense.id
      );
      await updateDoc(expenseDoc, { status });

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === expenseId ? { ...expense, status } : expense
        )
      );
      console.log(`Expense status updated to ${status}`);
    } catch (error) {
      console.error(
        `Error updating expense status to ${status}:`,
        error.message
      );
      setError(`Failed to update expense status. Please try again.`);
    }
  };

  const handleFilterChange = () => {
    setFilterexp(true);
  };

  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = filteredExpenses().slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = Array.from(
    { length: Math.ceil(expenses.length / itemsPerPage) },
    (_, i) => i + 1
  );

  const renderTooltip = (props, label) => (
    <Tooltip id="button-tooltip" {...props}>
      {label}
    </Tooltip>
  );

  const { isSidebarVisible } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div
      className={`container-larger responsive-container ${
        isSidebarVisible ? "sidebar-open" : " "
      }`}
    >
      <div className="content-wrapper">
        <div className="header d-flex justify-content-between align-items-center">
          <span className="mb-2">
            <OverlayTrigger
              placement="bottom"
              popperConfig={{
                modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
              }}
              delay={{ show: 100, hide: 100 }}
              overlay={(props) => renderTooltip(props, "Back")}
              show={!isSidebarVisible ? undefined : false}
            >
              <button
                className="btn btn-primary btn-back"
                style={{ fontSize: "15px",}}
                onClick={() => navigate(-1)}
              >
                <IoMdArrowRoundBack />
              </button>
            </OverlayTrigger>
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "95%",
            }}
          >
            <div className="d-flex align-items-center g-4">
              <h2 className="page-title ee-title text-dark">
                {employee.username || "Employee"}&apos;s Expenses
              </h2>
              <button
                className="btn btn-primary action-btn"
                onClick={() => setProfileView(true)}
              >
                <CgProfile />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                paddingRight: "20px",
              }}
              className="batch-actions"
            >
              {selectedExpenses.length >= 0 && (
                <div className="batch-actions-header ">
                  <button
                    className="btn btn-success btn-sm btn-app"
                    onClick={() => handleBatchExpenseStatusChange("Approved")}
                  >
                                                   <FaCheckDouble />
                                                   ({selectedExpenses.length})
                  </button>{" "}
                  <button
                    className="btn btn-danger btn-sm btn-rej"
                    onClick={() => handleBatchExpenseStatusChange("Rejected")}
                  >
                                                <FaXmark />
                                                ({selectedExpenses.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-header header-actions d-flex align-items-center ">
          <div className="d-flex header-text g-4">
            <div className="approve">
              <span className="summary-label">Approved:</span>
              <span className="summary-value approved">
                {expenses
                  .filter((expense) => expense.status === "Approved")
                  .reduce(
                    (total, expense) =>
                      total + (parseFloat(expense.amount) || 0),
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="rejected">
              <span className="summary-label">Rejected:</span>
              <span className="summary-value rejected">
                {expenses
                  .filter((expense) => expense.status === "Rejected")
                  .reduce(
                    (total, expense) =>
                      total - (parseFloat(expense.amount) || 0),
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="total">
              <span className="summary-label">Total Expense:</span>
              <span className="summary-value total">
                {expenses
                  .reduce((total, expense) => {
                    const amount = parseFloat(expense.amount) || 0;
                    return expense.status === "Approved"
                      ? total + amount
                      : expense.status === "Rejected"
                      ? total - amount
                      : total;
                  }, 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>

          <div className="filered-expense">
            <OverlayTrigger
              placement="bottom"
              popperConfig={{
                modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
              }}
              delay={{ show: 100, hide: 100 }}
              overlay={(props) => renderTooltip(props, "Filter")}
              show={!isSidebarVisible ? undefined : false}
            >
              <button
                className="btn btn-sm btn-filter"
                onClick={() => handleFilterChange()}
              >
                <IoFilterSharp />
              </button>
            </OverlayTrigger>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: "center", margin: "50px 0" }}>
            <img
              src="https://indiaai.gov.in/indiaAi-2021/build/images/Listing-page/gif/no-result.gif"
              alt="No expenses"
              style={{ maxWidth: "150px", marginBottom: "0px" }}
            />
            <h4>No Expenses Found</h4>
            <p>It seems there are no expenses recorded for this employee.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <MDBTable striped responsive>
              <MDBTableHead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {currentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={`table-${expense.status.toLowerCase()}`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={(e) =>
                          handleCheckboxChange(expense.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>{expense.title}</td>
                    <td>{expense.date}</td>
                    <td>{expense.category}</td>
                    <td>₹{expense.amount}</td>
                    <td>{expense.status || "Pending"}</td>
                    <td>
                      <OverlayTrigger
                        placement="bottom"
                        popperConfig={{
                          modifiers: [
                            { name: "offset", options: { offset: [0, 0] } },
                          ],
                        }}
                        delay={{ show: 100, hide: 100 }}
                        overlay={(props) => renderTooltip(props, "View")}
                        show={!isSidebarVisible ? undefined : false}
                      >
                        <span>
                          <button
                            className="btn btn-info action-btn"
                            onClick={() => handleViewClick(expense)}
                          >
                            <FaEye />
                          </button>
                        </span>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="bottom"
                        popperConfig={{
                          modifiers: [
                            { name: "offset", options: { offset: [0, 0] } },
                          ],
                        }}
                        delay={{ show: 100, hide: 100 }}
                        overlay={(props) => renderTooltip(props, "Approve")}
                        show={!isSidebarVisible ? undefined : false}
                      >
                        <span>
                          <button
                            className="btn btn-success action-btn"
                            onClick={() =>
                              handleExpenseStatusChange(expense.id, "Approved")
                            }
                            disabled={expense.status === "Approved"}
                          >
                            {expense.status === "Approved" ? (
                              <FaCheckDouble />
                            ) : (
                              <FaCheck />
                            )}
                          </button>
                        </span>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="bottom"
                        popperConfig={{
                          modifiers: [
                            { name: "offset", options: { offset: [0, 0] } },
                          ],
                        }}
                        delay={{ show: 100, hide: 100 }}
                        overlay={(props) => renderTooltip(props, "Reject")}
                        show={!isSidebarVisible ? undefined : false}
                      >
                        <span>
                          <button
                            className="btn btn-danger action-btn"
                            onClick={() =>
                              handleExpenseStatusChange(expense.id, "Rejected")
                            }
                            disabled={expense.status === "Rejected"}
                          >
                            <FaXmark />
                          </button>
                        </span>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
            <div
              className="pagination-container"
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
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
                {pageNumbers
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.min(pageNumbers.length, currentPage + 2)
                  )
                  .map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                {currentPage < pageNumbers.length - 4 && (
                  <li className="page-item disabled">
                    <span className="page-link">...</span>
                  </li>
                )}
                <li
                  className={`page-item ${
                    currentPage === pageNumbers.length ? "disabled" : ""
                  }`}
                >
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
        )}
      </div>
      {selectedImage && (
        <div
          className="modal modal-emp-exe"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{
              maxWidth: "90%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div className="modal-content">
              <div className="modal-body text-center ">
                <img
                  src={selectedImage}
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

      {showViewModal && selectedViewExpense && (
        <div
          className="modal modal-emp-exp"
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
                  onClick={() => setShowViewModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="expense-details d-flex justify-content-between align-items-center text-dark">
                  {selectedViewExpense.imageUrl && (
                    <div className="modal-res1 col text-center">
                      <img
                        src={selectedViewExpense.imageUrl}
                        onClick={() =>
                          handleImageClick(selectedViewExpense.imageUrl)
                        }
                        alt="Bill"
                        style={{ maxWidth: "70%" }}
                        className="img-fluid"
                      />
                    </div>
                  )}
                  <div
                    className={`modal-res ${
                      selectedViewExpense.imageUrl ? "col" : "col-12"
                    }`}
                  >
                    <div className="detail-row">
                      <strong>Title:</strong> {selectedViewExpense.title}
                    </div>
                    <div className="detail-row">
                      <strong>Amount:</strong> {selectedViewExpense.amount}
                    </div>
                    <div className="detail-row">
                      <strong>Type:</strong>{" "}
                      {selectedViewExpense.transactionType}
                    </div>
                    <div className="detail-row">
                      <strong>Category:</strong> {selectedViewExpense.category}
                    </div>
                    <div className="detail-row">
                      <strong>Date:</strong> {selectedViewExpense.date}
                    </div>
                    <div className="detail-row">
                      <strong>Time:</strong> {selectedViewExpense.time}
                    </div>
                    {selectedViewExpense.remark && (
                      <div className="detail-row">
                        <strong>Remark:</strong> {selectedViewExpense.remark}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileView && (
        <div
          className="modal modal-emp-exe"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{}}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {employee.username}&apos;s Profile
                </h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setProfileView(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="expense-details text-dark">
                  {employee.employee_logo && (
                    <div className="text-center mb-3">
                      <img
                        src={employee.employee_logo}
                        onClick={() => handleImageClick(employee.employee_logo)}
                        alt="Bill"
                        style={{ maxWidth: "200px" }}
                        className="img-fluid"
                      />
                    </div>
                  )}
                  <div className="detail-row">
                    <strong>Employee Name:</strong>
                    {employee.username}
                  </div>
                  <div className="detail-row">
                    <strong>Email:</strong> {employee.email}
                  </div>
                  <div className="detail-row">
                    <strong>Phone:</strong> {employee.mobile}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* filter expense modal */}
      {filterexp && (
        <div
          className="modal modal-emp-exe"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{}}>
              <div className="modal-header">
                <h5 className="modal-title">Filter Expenses</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setFilterexp(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <span>
                  <label className="form-label">From Date :</label>
                  <input
                    type="date"
                    className="form-control fc-date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </span>
                <span>
                  <label className="form-label"> To Date :</label>
                  <input
                    type="date"
                    className="form-control fc-date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </span>
                <span className="status">
                  <label className="form-label">Status :</label>
                  <select
                    className="form-control"
                    id="status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option alt="Select Status" className="text-muted">
                      ---Select Status---
                    </option>
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </span>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setFilterexp(false);
                      setFromDate("");
                      setToDate("");
                      setFilterStatus("all");
                    }}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setFilterexp(false);
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeExpense;
