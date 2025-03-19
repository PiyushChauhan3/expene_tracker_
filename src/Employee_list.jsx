import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { FaCamera, FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { useAuth } from "./AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import {
  MDBBadge,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import "./styles/Employee_list.css"; 
import defaultImage from "./team-member.jpg";
import { Link, useNavigate } from "react-router-dom"; // Update this import
import LoadingSpinner from "./Component/LoadingSpinner";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const EmployeeList = () => {
  const { isSidebarVisible } = useAuth();
  const [expandedEmployeeIds, setExpandedEmployeeIds] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editExpenseForm, setEditExpenseForm] = useState({});
  const [sarchData, setsarchData] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({});
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [allExpenses, setAllExpeses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false); // New state for image loading
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  const [expensesToReject, setExpensesToReject] = useState([]);

  const [selectedEmployeeExpenses, setSelectedEmployeeExpenses] = useState([]);
  const [showExpensePopup, setShowExpensePopup] = useState(false);
  const [reject, setReject] = useState(false);
  const navigate = useNavigate(); // Update this line
  const [screenSize, setScreenSize] = useState("desktop");
  const [localImagePreview, setLocalImagePreview] = useState(null);
  // console.log("Admin ID from localStorage:", localStorage.getItem("adminDocId"));

  const handleExpensePage = (employeeId) => {
    navigate(`/${employeeId}`); 
  };

  const handleRejectClick = (expenseIds) => {
    setExpensesToReject(expenseIds);
    setShowRejectConfirmation(true);
  };

  const closeExpensePopup = () => {
    setShowExpensePopup(false);
    setSelectedEmployeeExpenses([]);
  };

  const confirmReject = async () => {
    try {
      for (const expenseId of expensesToReject) {
        await handleExpenseStatusChange(expenseId, "Rejected");
      }
      setSelectedExpenses([]); // Clear selected expenses after rejection
      setShowRejectConfirmation(false); // Close the confirmation modal
      // console.log("Expenses rejected successfully.");
    } catch (error) {
      console.error("Error rejecting expenses:", error);
      setError("Failed to reject expenses. Please try again.");
    }
  };

  const cancelReject = () => {
    setShowRejectConfirmation(false); // Close the confirmation modal without rejecting
  };

  const handleCheckboxChange = (expenseId, isChecked) => {
    setSelectedExpenses((prev) =>
      isChecked ? [...prev, expenseId] : prev.filter((id) => id !== expenseId)
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allExpenseIds = selectedEmployeeExpenses.map(
        (expense) => expense.id
      );
      setSelectedExpenses(allExpenseIds);
    } else {
      setSelectedExpenses([]);
    }
  };

  useEffect(() => {
    const fetchEmployeesAndExpenses = async () => {
      setLoading(true);
      try {
        const adminId = localStorage.getItem("adminDocId");
        if (!adminId) {
          console.error("Admin ID is not available in localStorage.");
          setLoading(false);
          return;
        }

        // Fetch Employees
        const employeesRef = collection(db, "Users");
        const q = query(employeesRef, where("adminId", "==", adminId));
        const querySnapshot = await getDocs(q);

        const employeeList = [];
        const expensePromises = [];

        querySnapshot.docs.forEach((doc) => {
          const employeeData = { id: doc.id, ...doc.data() };
          employeeList.push(employeeData);

          // Fetch Expenses for this Employee, excluding Approved/Rejected
          const expensesRef = collection(db, `Users/${doc.id}/expense`);
          const expensesPromise = getDocs(expensesRef).then((expensesSnapshot) =>
            expensesSnapshot.docs
              .map((expenseDoc) => ({
                id: expenseDoc.id,
                ...expenseDoc.data(),
                employeeId: doc.id, // Add employee ID for reference
              }))
              .filter(
                (expense) =>
                  expense.status !== "Approved" && expense.status !== "Rejected"
              )
          );
          expensePromises.push(expensesPromise);
        });

        const allExpenses = (await Promise.all(expensePromises)).flat();

        // Sort employees by createdAt field in descending order
        const sortedEmployeeList = employeeList.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis(); // For Firestore Timestamp
          }
          return 0; // Keep order if createdAt is not available
        });

        setEmployees(sortedEmployeeList);
        setAllExpeses(allExpenses);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesAndExpenses();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        setScreenSize("mobile");
      } else if (width <= 992) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteClick = (employeeId) => {
    // Show the delete confirmation modal
    setEmployeeToDelete(employeeId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete employee from Firestore
      const employeeDocRef = doc(db, "Users", employeeToDelete);
      await deleteDoc(employeeDocRef); // Firebase Firestore delete operation

      // Remove employee from local state
      const updatedEmployees = employees.filter(
        (employee) => employee.id !== employeeToDelete
      );
      setEmployees(updatedEmployees); // Update employees state

      // Close the confirmation modal
      setShowDeleteConfirmation(false);
      // console.log("Employee deleted successfully.");
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError("Failed to delete employee. Please try again.");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmation(false); // Close the confirmation modal without deleting
  };

  const handleSearch = (e) => {
    setsarchData(e.target.value);
  };
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setEditForm({ ...employee });
  };

  const toggleEmployeeExpenses = (employeeId) => {
    setExpandedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleEditChange = async (e) => {
    const { name, value, files } = e.target;
  
    if (files && files[0]) {
      const file = files[0];
      // Create local preview URL
      const previewURL = URL.createObjectURL(file);
      setLocalImagePreview(previewURL);
      setEditForm(prev => ({
        ...prev,
        [name]: file
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleEditSubmit = async () => {
    if (!editingEmployee) return;
    setImageLoading(true);
  
    try {
      const employeeDoc = doc(db, "Users", editingEmployee.id);
      const updatedData = { ...editForm };
  
      // Only upload image if it's a File object (new image selected)
      if (editForm.employee_logo instanceof File) {
        const formData = new FormData();
        formData.append("file", editForm.employee_logo);
        formData.append("upload_preset", "ml_default");
  
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/due0loh2v/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
  
        if (!response.ok) throw new Error('Failed to upload image');
        
        const data = await response.json();
        updatedData.employee_logo = data.secure_url;
      }
  
      // Update Firestore document
      await updateDoc(employeeDoc, updatedData);
  
      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === editingEmployee.id ? { ...emp, ...updatedData } : emp
        )
      );
  
      setEditingEmployee(null);
      setLocalImagePreview(null);
    } catch (error) {
      console.error("Error updating employee:", error);
      setError("Failed to update employee. Please try again.");
    } finally {
      setImageLoading(false);
    }
  };
  

  const handleApproveExpense = (index) => {
    setSelectedEmployeeExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      updatedExpenses[index].status = "Approved";
      return updatedExpenses;
    });
  };

  const handleRejectExpense = (index) => {
    setSelectedEmployeeExpenses((prevExpenses) => {
      const updatedExpenses = [...prevExpenses];
      updatedExpenses[index].status = "Rejected";
      return updatedExpenses;
    });
  };

  const handleBatchExpenseStatusChange = async (status) => {
    try {
      for (const expenseId of selectedExpenses) {
        await handleExpenseStatusChange(expenseId, status);
      }
      setSelectedExpenses([]); // Clear selected expenses after action
    } catch (error) {
      console.error(`Error updating batch expenses to ${status}:`, error);
    }
  };

  const handleExpenseStatusChange = async (expenseId, isActive) => {
    const updatedExpense = selectedEmployeeExpenses.find(
      (expense) => expense.id === expenseId
    );
    if (!updatedExpense) return;

    try {
      // Update the expense status in Firestore
      const expenseDoc = doc(
        db,
        `Users/${updatedExpense.employeeId}/expense`,
        updatedExpense.id
      );
      await updateDoc(expenseDoc, { isActive });

      // Update local state: Remove the expense from selectedEmployeeExpenses
      setSelectedEmployeeExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );

      // Optionally update the main expenses list
      setAllExpeses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );

      // console.log(`Expense isActive updated to ${isActive}`);
    } catch (error) {
      console.error(
        `Error updating expense isActive to ${isActive}:`,
        error.message
      );
      setError(`Failed to update expense isActive. Please try again.`);
    }
  };

  const handleStatusChange = async (employeeId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const employeeDoc = doc(db, "Users", employeeId);
      await updateDoc(employeeDoc, { isActive: newStatus });

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, isActive: newStatus } : emp
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    }
  };

  const indexOfLastEmployee = currentPage * itemsPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
  
  const filteredEmployees = employees.filter((employee) => {
    const searchValue = sarchData.toLowerCase();
    return (
      employee.username?.toLowerCase().includes(searchValue) ||
      employee.email?.toLowerCase().includes(searchValue) ||
      employee.mobile?.toLowerCase().includes(searchValue)
    );
  });

  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  
  // Update the paginate function to handle edge cases
  const paginate = (pageNumber) => {
    const newPage = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(newPage);
  };

  const getEmployeeStatusBadge = (isActive) => {
    return (
      <MDBBadge
        color={isActive ? "success" : "danger"}
        pill
        className="isActive-badge"
      >
        {isActive ? "Active" : "Inactive"}
      </MDBBadge>
    );
  };

  const getEmployeeStatusButton = (employee) => {
    return (
      <button
        className={`btn btn-sm ${
          employee.isActive ? "btn-success" : "btn-danger"
        }`}
        onClick={() => handleStatusChange(employee.id, employee.isActive)}
      >
        {employee.isActive ? "Active" : "Inactive"}
      </button>
    );
  };

   const renderTooltip = (props, label) => (
      <Tooltip id="button-tooltip" {...props}>
        {label}
      </Tooltip>
    );

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div
      className={`container-larger emp-list-container ${
        isSidebarVisible ? "sidebar-open" : ""
      }`}
    >
      <div className="">
        {/* Header section */}
        <div className="header d-flex justify-content-between align-items-center">
          <h3 className="page-title">Employee List</h3>
          {screenSize !== "mobile" && (
            <div className="breadcrumb-wrapper">
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/Employee_list">Employee</Link>
                </li>
                <li className="breadcrumb-item active">Employee List</li>
              </ul>
            </div>
          )}
        </div>

        {/* Card section */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="card-title mb-0">Employee List</h4>
            <div className="search-wrapper header-left">
              <input
                value={sarchData}
                onChange={handleSearch}
                type="text"
                placeholder="Search employees..."
                className="responsive-input"
              />
              {sarchData && (
                <button
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  className="clear-search"
                  onClick={() => setsarchData("")}
                >
                  <i className="fa fa-times" aria-hidden="true"></i>
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            {employees.length === 0 ? (
              <div style={{ textAlign: "center", margin: "50px 0" }}>
                <img
                  src="https://indiaai.gov.in/indiaAi-2021/build/images/Listing-page/gif/no-result.gif"
                  alt="No employees"
                  style={{ maxWidth: "150px", marginBottom: "0px" }}
                />
                <h4>No Employees Found</h4>
                <p>
                  It seems you haven&apos;t added any employees yet. Start by
                  adding some!
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div style={{ textAlign: "center", margin: "50px 0" }}>
                <img
                  src="https://indiaai.gov.in/indiaAi-2021/build/images/Listing-page/gif/no-result.gif"
                  alt="No results"
                  style={{ maxWidth: "150px", marginBottom: "0px" }}
                />
                <h4>No Results Found</h4>
                <p>Try adjusting your search to find what you're looking for.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  {screenSize === "mobile" ? (
                    <div className="mobile-view">
                      {currentEmployees.map((employee) => (
                        <div key={employee.id} className="mobile-employee-card">
                          <div className="card-header">
                            <div className="d-flex gap-4 align-items-center">
                              <div className="employee-image  ">
                                {employee.employee_logo ? (
                                  <img
                                    src={employee.employee_logo}
                                    alt={employee.username}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                    }}
                                    onClick={() =>
                                      handleImageClick(employee.employee_logo)
                                    }
                                  />
                                ) : (
                                  <img
                                    src={defaultImage}
                                    alt="Default"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                    }}
                                  />
                                )}
                              </div>
                              <div className="employee-info">
                                <h6 className="mb-0">{employee.username}</h6>
                              </div>
                            </div>
                            <div>
                              {getEmployeeStatusBadge(
                                employee.isActive !== false
                              )}
                            </div>
                          </div>

                          <div className="card-content">
                            <div className="info-row">
                              <span className="info-label">Phone:</span>
                              <span className="info-value">
                                {employee.mobile}
                              </span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Email:</span>
                              <span className="info-value">
                                {employee.email}
                              </span>
                            </div>
                            <div className="info-row">
                              <span className="info-label">Password:</span>
                              <span className="info-value">
                                {employee.password.replace(/./g, "*")}
                              </span>
                            </div>
                          </div>

                          <div className="card-actions">
                            <div className="action-button">
                              <button
                                onClick={() => handleEditClick(employee)}
                                className="btns btn-sm btn-primaryy"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(employee.id)}
                                className="btns btn-sm btn-danger"
                              >
                                <FaTrashAlt />
                              </button>
                              <button
                                className={`btns  ${
                                  allExpenses.filter(
                                    (e) => e.employeeId === employee.authUid
                                  ).length === 0
                                    ? "btn-secondary"
                                    : "btn-info"
                                }`}
                                onClick={() =>
                                  handleExpensePage(employee.authUid)
                                  
                                }
                              >
                                <FaEye />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <MDBTable
                      striped
                      hover
                      responsive
                      className="desktop-table"
                    >
                      <MDBTableHead>
                        <tr>
                          <th>Image</th>
                          <th>Employee Name</th>
                          <th>Phone</th>
                          <th>Email</th>
                          <th>Password</th>
                          <th>Status</th>
                          {/* <th>Expenses</th> */}
                          <th>Actions</th>
                        </tr>
                      </MDBTableHead>
                      <MDBTableBody>
                        {currentEmployees.map((employee) => (
                          <React.Fragment key={employee.id}>
                            <tr>
                              <td>
                                {employee.employee_logo ? (
                                  <img
                                    src={employee.employee_logo}
                                    alt="Employee"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleImageClick(employee.employee_logo)
                                    }
                                  />
                                ) : (
                                  <span style={{ color: "gray" }}>
                                    <img
                                      src={defaultImage}
                                      alt="Employee"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        cursor: "pointer",
                                      }}
                                    ></img>
                                  </span>
                                )}
                              </td>
                              <td>{employee.username}</td>
                              <td>{employee.mobile}</td>
                              <td>{employee.email}</td>
                              <td>{employee.password.replace(/./g, "*")}</td>
                              <td>{getEmployeeStatusButton(employee)}</td>
                              <td>

                              <OverlayTrigger
                                              placement="bottom"
                                              popperConfig={{
                                                modifiers: [
                                                  { name: "offset", options: { offset: [0, 0] } },
                                                ],
                                              }}
                                              delay={{ show: 100 , hide: 100 }}
                                              overlay={(props) => renderTooltip(props, "View")}
                                              show={!isSidebarVisible ? undefined : false}
                                            >
                              <button
                                  className={`btn action-btn  ${
                                    allExpenses.filter(
                                      (e) => e.employeeId === employee.authUid
                                    ).length === 0
                                      ? "btn-secondary"
                                      : "btn-info"
                                  }`}
                                 
                                  onClick={() =>
                                    handleExpensePage(employee.authUid)
                                  }
                                  // disabled={
                                  // allExpenses.filter(
                                  //   (e) => e.employeeId === employee.authUid
                                  // ).length === 0
                                  // }
                                >
                                  
                                  <FaEye />
                                </button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                              placement="bottom"
                                              popperConfig={{
                                                modifiers: [
                                                  { name: "offset", options: { offset: [0, 0] } },
                                                ],
                                              }}
                                              delay={{ show: 100 , hide: 100 }}
                                              overlay={(props) => renderTooltip(props, "Edit")}
                                              show={!isSidebarVisible ? undefined : false}
                                            >
                                <button
                                  onClick={() => handleEditClick(employee)}
                                  className="btn action-btn"
                                  style={{
                                    backgroundColor: "blue",
                                  
                                  }}
                                >
                                  <FaEdit size={15} />
                                </button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                              placement="bottom"
                                              popperConfig={{
                                                modifiers: [
                                                  { name: "offset", options: { offset: [0, 0] } },
                                                ],
                                              }}
                                              delay={{ show: 100 , hide: 100 }}
                                              overlay={(props) => renderTooltip(props, "Delete")}
                                              show={!isSidebarVisible ? undefined : false}
                                            >
                                <button
                                  onClick={() => handleDeleteClick(employee.id)}
                                  className="btn action-btn"
                                  style={{
                                    backgroundColor: "red",
                                    
                                  }}
                                >
                                  <FaTrashAlt size={15} />
                                </button>
                                </OverlayTrigger>
                              
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </MDBTableBody>
                    </MDBTable>
                  )}
                </div>

                <div
                  className="pagination-container"
                  style={{ marginTop: "20px", textAlign: "center" }}
                >
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                        Previous
                      </button>
                    </li>
                    {currentPage > 3 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    {/* Generate dynamic page numbers */}
                    {(() => {
                      const pageNumbers = [];
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);

                      // Adjust the range to always show 5 numbers if possible
                      if (totalPages <= 5) {
                        startPage = 1;
                        endPage = totalPages;
                      } else {
                        if (currentPage <= 3) {
                          startPage = 1;
                          endPage = 5;
                        } else if (currentPage >= totalPages - 2) {
                          startPage = totalPages - 4;
                          endPage = totalPages;
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                      }

                      return pageNumbers.map((number) => (
                        <li
                          key={number}
                          className={`page-item ${currentPage === number ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => paginate(number)}>
                            {number}
                          </button>
                        </li>
                      ));
                    })()}
                    {currentPage < totalPages - 2 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>

                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ...existing modals... */}
      {editingEmployee && (
        <div
          className="modal"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setEditingEmployee(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form>
                  {/* <div className="mb-3">
                    <label className="form-label">Profile Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="employee_logo"
                      onChange={handleEditChange}
                    />
                    {imageLoading ? (
                      <div style={{ marginTop: "10px", textAlign: "center" }}>
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">
                            Uploading...
                          </span>
                        </div>
                        <p>Uploading Image...</p>
                      </div>
                    ) : (
                      editForm.employee_logo && (
                        <div>
                          {editForm.employee_logo instanceof File ? (
                            <p>{editForm.employee_logo.name}</p>
                          ) : (
                            <img
                              src={editForm.employee_logo}
                              alt="Profile Preview"
                              style={{ width: "100px", marginTop: "10px" }}
                            />
                          )}
                        </div>
                      )
                    )}
                  </div> */}
                  <div className="mb-3">
                    <div className="profile-section">
                      <div className="profile-image-wrapper">
                        <div className="profile-image">
                          {imageLoading ? (
                            <div
                              className="spinner-border text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Uploading...
                              </span>
                            </div>
                          ) : (
                            <img
                              src={
                                localImagePreview ||
                                (editForm.employee_logo instanceof File
                                  ? URL.createObjectURL(editForm.employee_logo)
                                  : editForm.employee_logo || defaultImage)
                              }
                              alt="Profile Preview"
                              style={{ width: "100px", marginTop: "0px" }}
                            />
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
                          className="form-control"
                          name="employee_logo"
                          onChange={handleEditChange}
                          hidden
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Employee Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={editForm.username}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={editForm.mobile}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="d-flex align-items-center position-relative">
                      <input
                        type={editForm.showPassword ? "text" : "password"}
                        className="form-control"
                        name="password"
                        value={editForm.password}
                        onChange={handleEditChange}
                      />
                      <span
                        className="position-absolute"
                        style={{
                          right: "10px",
                          cursor: "pointer",
                          color: "grey",
                        }}
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            showPassword: !prev.showPassword,
                          }))
                        }
                      >
                        {editForm.showPassword ? (
                          <i className="fas fa-eye-slash"></i>
                        ) : (
                          <i className="fas fa-eye"></i>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="status"
                        checked={editForm.isActive !== false}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">
                        {editForm.isActive !== false ? "Active" : "Inactive"}
                      </label>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingEmployee(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn bttt btn-primary"
                  onClick={handleEditSubmit}
                  disabled={imageLoading}
                >
                  {imageLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedImage && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center">
                <img
                  src={selectedImage}
                  alt="Bill"
                  className="img-fluid"
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

      {showRejectConfirmation && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Rejection</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={cancelReject}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to reject these expenses?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelReject}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmReject}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmation && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={cancelDelete}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: "black" }}>
                  Are you sure you want to delete this employee?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeList;
