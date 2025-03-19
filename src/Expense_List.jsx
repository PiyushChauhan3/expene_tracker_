import { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  FaEdit,
  FaTrashAlt,
  FaPrint,
  FaDownload,
  FaPlus,
  FaEye,
} from "react-icons/fa";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import React from "react";
import {
  MDBBadge,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
} from "mdb-react-ui-kit";
import defaultImage from "./bill-def-img.png";
import "./styles/Expense_List.css?v=11.11.11.11"; // import external css
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ThreeCircles } from "react-loader-spinner";
import LoadingSpinner from "./Component/LoadingSpinner";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Expense_List = () => {
  const [sarchData, setsarchData] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    transactionType: "",
    category: "",
    date: "",
    time: "",
    imageUrl: "",
    remark: "",
    createdAt: serverTimestamp(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Change to useState
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  useState("desc");
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [imageLoading, setImageLoading] = useState(false); // New state for image loading
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [showPDF, setShowPDF] = useState(false);
  const { isSidebarVisible } = useAuth();
  const [pdfExpense, setPdfExpense] = useState(null);
  const [localImage, setLocalImage] = useState(null); // Add this state
  const [localImageUrl, setLocalImageUrl] = useState(null); // Add this state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewExpense, setSelectedViewExpense] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchExpenses = async (adminId) => {
      // Accept adminId as a parameter
      try {
        setLoading(true); // Show loader before fetching data
        const querySnapshot = await getDocs(
          collection(db, `Admin/${adminId}/expense`)
        );

        const expenseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedEmployeeList = expenseList.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis(); // For Firestore Timestamp
          }
          return 0; // Keep order if createdAt is not available
        });

        setExpenses(sortedEmployeeList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const adminId = user.uid;
        setAdminId(adminId);
        fetchExpenses(adminId); // Pass adminId to fetchExpenses
      } else {
        setLoading(false);
        setExpenses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowViewModal(false);
  };
  const closeModal = () => setSelectedImage(null);

  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setEditForm({ ...expense });
  };

  const handleEditClickView = (selectedExpenses) => {
    setEditingExpense(selectedExpenses);
    setEditForm({ ...selectedExpenses });
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const storage = getStorage();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalImage(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setLocalImageUrl(previewUrl);
      // Update form without uploading
      setEditForm((prev) => ({
        ...prev,
        imageUrl: null, // Clear previous remote URL
      }));
    }
  };

  const handleEditSubmit = async () => {
    if (editingExpense) {
      try {
        setLoading(true);
        let imageURL = editForm.imageUrl;

        // Upload image if there's a new local image
        if (localImage) {
          setImageLoading(true);
          const formData = new FormData();
          formData.append("file", localImage);
          formData.append("upload_preset", "ml_default");

          const response = await fetch(
            "https://api.cloudinary.com/v1_1/due0loh2v/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await response.json();
          imageURL = data.secure_url;
          setImageLoading(false);
        }

        const expenseDoc = doc(
          db,
          `Admin/${adminId}/expense`,
          editingExpense.id
        );

        // Update with all form data including new image URL if uploaded
        await updateDoc(expenseDoc, {
          ...editForm,
          imageUrl: imageURL,
        });

        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === editingExpense.id
              ? { ...exp, ...editForm, imageUrl: imageURL }
              : exp
          )
        );

        // Clean up
        setEditingExpense(null);
        setLocalImage(null);
        setLocalImageUrl(null);
        URL.revokeObjectURL(localImageUrl);
      } catch (error) {
        console.error("Error updating expense:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update expense",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (id) => {
    setExpenseToDelete(id);
    setShowDeleteConfirmation(true);
  };
  const confirmDeleteExpense = async () => {
    setLoading(true); // Show loader
    try {
      // Delete expense from Firestore
      await deleteDoc(doc(db, `Admin/${adminId}/expense`, expenseToDelete));
      // Remove expense from local state
      setExpenses((prev) =>
        prev.filter((expense) => expense.id !== expenseToDelete)
      );
      setShowDeleteConfirmation(false); // Close the confirmation modal
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };
  const cancelDeleteExpense = () => {
    // Close the confirmation modal without deleting
    setShowDeleteConfirmation(false);
  };

  const handleBulkDeleteClick = () => {
    if (selectedExpenses.length > 0) {
      setShowBulkDeleteConfirmation(true);
    }
  };
  // Confirm bulk delete

  const confirmBulkDelete = async () => {
    setLoading(true); // Show loader
    try {
      for (const expenseId of selectedExpenses) {
        await deleteDoc(doc(db, `Admin/${adminId}/expense`, expenseId));
      }
      setExpenses((prev) =>
        prev.filter((exp) => !selectedExpenses.includes(exp.id))
      );
      setSelectedExpenses([]); // Clear the selected items
      setShowBulkDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting selected expenses:", error);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const cancelBulkDelete = () => setShowBulkDeleteConfirmation(false);

  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      // Add the expense ID to the selected list
      setSelectedExpenses((prev) => [...prev, id]);
    } else {
      // Remove the expense ID from the selected list
      setSelectedExpenses((prev) =>
        prev.filter((expenseId) => expenseId !== id)
      );
    }
  };

  const handlePrintClick = () => {
    Swal.fire({
      title: "Download as",
      html: `
        <div style="text-align: left; padding: 20px;">
          <div style="margin-bottom: 20px;">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="exportFormat" id="pdfFormat" value="pdf" checked>
              <label class="form-check-label" for="pdfFormat">
                PDF
              </label>
            </div>
             
            <div class="form-check">
              <input class="form-check-input" type="radio" name="exportFormat" id="excelFormat" value="excel">
              <label class="form-check-label" for="excelFormat">
                Excel 
              </label>
          </div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button class="btn btn-primary" onclick="window.openSelected()">Open</button>
            <button class="btn btn-success" onclick="window.downloadSelected()">Download</button>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        window.openSelected = () => {
          const format = document.querySelector(
            'input[name="exportFormat"]:checked'
          ).value;
          if (format === "pdf") {
            generatePDF("open");
          } else {
            generateExcel("open");
          }
          Swal.close();
        };
        window.downloadSelected = () => {
          const format = document.querySelector(
            'input[name="exportFormat"]:checked'
          ).value;
          if (format === "pdf") {
            generatePDF("download");
          } else {
            generateExcel("download");
          }
          Swal.close();
        };
      },
    });
  };

  const generatePDF = async (action) => {
    try {
      const pdfDoc = new jsPDF();

      // Add header
      pdfDoc.setFontSize(22);
      pdfDoc.text("Expense Summary", pdfDoc.internal.pageSize.width / 2, 20, {
        align: "center",
      });

      // Add company info
      pdfDoc.setFontSize(12);
      const role = localStorage.getItem("Role");
      let username = "Unknown User";
      let email = "NA";

      if (role === "admin") {
        const adminId = localStorage.getItem("adminDocId");
        const adminDocRef = doc(db, "Admin", adminId);
        const adminDocSnap = await getDoc(adminDocRef);
        username = adminDocSnap.exists()
          ? adminDocSnap.data().username
          : "Admin";
        email = adminDocSnap.exists() ? adminDocSnap.data().email : "NA";
      }

      pdfDoc.text(`Name: ${username}`, 14, 30);
      pdfDoc.text(`Email: ${email}`, 14, 38);
      pdfDoc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);
      pdfDoc.text(`Total Expenses: ${expenses.length}`, 14, 54);

      // Calculate total amount
      const totalAmount = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );
      pdfDoc.text(`Total Amount: ${totalAmount.toFixed(2)}`, 14, 62);

      // Add table
      pdfDoc.autoTable({
        startY: 70,
        head: [["Title", "Amount", "Type", "Category", "Date", "Time"]],
        body: expenses.map((exp) => [
          exp.title || "",
          exp.amount?.toString() || "",
          exp.transactionType || "",
          exp.category || "",
          exp.date || "",
          exp.time || "",
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [71, 71, 71],
          fontSize: 9,
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25, halign: "right" },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
      });

      // Footer
      const pageCount = pdfDoc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdfDoc.setPage(i);
        pdfDoc.setFontSize(8);
        pdfDoc.text(
          `Page ${i} of ${pageCount}`,
          pdfDoc.internal.pageSize.width / 2,
          pdfDoc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      if (action === "download") {
        pdfDoc.save("expense_report.pdf");
      } else {
        window.open(pdfDoc.output("bloburl"), "_blank");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate PDF",
      });
    }
  };

  const generateExcel = async (action) => {
    try {
      const role = localStorage.getItem("Role");
      let username = "Unknown User";
      let email = "NA";

      if (role === "admin") {
        const adminId = localStorage.getItem("adminDocId");
        const adminDocRef = doc(db, "Admin", adminId);
        const adminDocSnap = await getDoc(adminDocRef);
        username = adminDocSnap.exists()
          ? adminDocSnap.data().username
          : "Admin";
        email = adminDocSnap.exists() ? adminDocSnap.data().email : "NA";
      }

      // Calculate total amount
      const totalAmount = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Add header information
      const headerData = [
        ["Expense Summary"],
        [],
        [`Name: ${username}`],
        [`Email: ${email}`],
        [`Date: ${new Date().toLocaleDateString()}`],
        [`Total Expenses: ${expenses.length}`],
        [`Total Amount: ${totalAmount.toFixed(2)}`],
        [],
        // Table headers
        ["Title", "Amount", "Type", "Category", "Date", "Time", "remark"],
      ];

      // Add expense data
      const expenseData = expenses.map((exp) => [
        exp.title || "",
        exp.amount || "",
        exp.transactionType || "",
        exp.category || "",
        exp.date || "",
        exp.time || "",
        exp.remark || "",
      ]);

      // Combine header and data
      const allData = [...headerData, ...expenseData];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(allData);

      // Style the header (merge cells for title)
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge cells for title
      ];

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Title
        { wch: 15 }, // Amount
        { wch: 15 }, // Type
        { wch: 20 }, // Category
        { wch: 15 }, // Date
        { wch: 15 }, // Time
        { wch: 30 }, // remark
      ];
      worksheet["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

      if (action === "download") {
        XLSX.writeFile(workbook, "expense_report.xlsx");
      } else {
        // For opening in web Excel
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error generating Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to generate Excel file",
      });
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const filteredExpenses = expenses.filter((expense) => {
    const searchValue = sarchData.toLowerCase();
    return (
      expense.title.toLowerCase().includes(searchValue) ||
      expense.amount.toString().toLowerCase().includes(searchValue) ||
      expense.transactionType.toLowerCase().includes(searchValue) ||
      expense.category.toLowerCase().includes(searchValue)
    );
  });
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = Array.from(
    { length: Math.ceil(filteredExpenses.length / itemsPerPage) },
    (_, i) => i + 1
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  const handleSearch = (e) => {
    setsarchData(e.target.value);
  };

  const handleViewClick = (expense) => {
    setSelectedViewExpense(expense);
    setShowViewModal(true);
  };

  const renderTooltip = (props, label) => (
    <Tooltip id="button-tooltip" {...props}>
      {label}
    </Tooltip>
  );

  return (
    <div
      className={`container-larger admin-expense-list-container ${
        isSidebarVisible ? "sidebar-open" : " "
      } `}
    >
      <div className="page-header">
        <h3 className="page-title">Expenses List</h3>
        <div className="breadcrumb-wrapper">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/expense_list">Expenses</Link>
            </li>
            <li className="breadcrumb-item active">Expenses List</li>
          </ol>
        </div>
      </div>

      <div className="expense-content">
        <div className="card">
          <div className="card-header">
            <div className="header-content">
              <div className="header-left">
                <h4 className="card-title">Expense List</h4>
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    onChange={handleSearch}
                    className="search-input"
                    value={sarchData}
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
              <div
                className="header-right"
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <OverlayTrigger
                  placement="bottom"
                  popperConfig={{
                    modifiers: [
                      { name: "offset", options: { offset: [0, 0] } },
                    ],
                  }}
                  delay={{ show: 100, hide: 100 }}
                  overlay={(props) => renderTooltip(props, "Delete")}
                  show={!isSidebarVisible ? undefined : false}
                >
                  <span>
                    {selectedExpenses.length >= 0 && (
                      <button
                        className="btn btn-danger btndanger d-flex align-items-center "
                        onClick={handleBulkDeleteClick}
                        disabled={
                          selectedExpenses.length === 0 ||
                          selectedExpenses.length === 1
                        }
                      >
                        <FaTrashAlt />({selectedExpenses.length})
                      </button>
                    )}
                  </span>
                </OverlayTrigger>
                <div
                  className="header-right"
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <OverlayTrigger
                    placement="bottom"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, 0] } },
                      ],
                    }}
                    delay={{ show: 100, hide: 100 }}
                    overlay={(props) => renderTooltip(props, "Download")}
                    show={!isSidebarVisible ? undefined : false}
                  >
                    <button
                      className="btn btn-primary "
                      onClick={handlePrintClick}
                    >
                      <FaDownload />
                    </button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    popperConfig={{
                      modifiers: [
                        { name: "offset", options: { offset: [0, 0] } },
                      ],
                    }}
                    delay={{ show: 100, hide: 100 }}
                    overlay={(props) => renderTooltip(props, "Add Expense")}
                    show={!isSidebarVisible ? undefined : false}
                  >
                    <button className="btn btn-primary">
                      <Link
                        to="/addexpenses"
                        style={{
                          textDecoration: "none",
                          color: "white",
                        }}
                      >
                        {" "}
                        <FaPlus />{" "}
                      </Link>
                    </button>
                  </OverlayTrigger>
                </div>
               
              </div>
            </div>
          </div>
          
          <div className="show-entries mt-2 mb-0">
            <div
              style={{
                marginLeft: "20px",
                height: "30px",
              }}
              className="show-entries-header d-flex align-items-center"
            >
              <span>Show entries :</span>
              <select
                name="entries"
                id="entries"
                className="form-select"
                style={{
                  marginLeft: "10px",
                  height: "30px",
                  maxWidth: "100px",
                }}
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            
          </div>

          <div className="card-body">
            {isMobile ? (
              <div className="mobile-expenses">
                {currentExpenses.length > 0 ? (
                  currentExpenses.map((expense) => (
                    <div key={expense.id} className="expense-card">
                      <div className="card-top">
                        <input
                          type="checkbox"
                          style={{
                            transform: "scale(1.5)",
                            cursor: "pointer",
                            marginRight: "10px",
                          }}
                          onChange={(e) => handleCheckboxChange(e, expense.id)}
                          checked={selectedExpenses.includes(expense.id)}
                        />
                        {expense.imageUrl ? (
                          <img
                            src={expense.imageUrl}
                            alt="Bill"
                            width="50"
                            onClick={() => handleImageClick(expense.imageUrl)}
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <img
                            src={defaultImage}
                            alt="Bill"
                            width="50"
                            onClick={() => handleImageClick(expense.imageUrl)}
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      </div>
                      <div className="card-content">
                        <div>
                          <strong>Title:</strong> {expense.title}
                        </div>
                        <div>
                          <strong>Amount:</strong> {expense.amount}
                        </div>
                        <div>
                          <strong>Type:</strong> {expense.transactionType}
                        </div>
                        <div>
                          <strong>Category:</strong> {expense.category}
                        </div>
                        <div>
                          <strong>Date:</strong> {expense.date}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() => handleEditClick(expense)}
                          className="btns btn-sm btn-primaryy"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          className="btns btn-sm btn-danger"
                        >
                          <FaTrashAlt />
                        </button>
                        <button
                          color="info"
                          size="sm"
                          className="btns btn-sm btn-secondary"
                          onClick={() => handleViewClick(expense)}
                          style={{ marginRight: "10px" }}
                        >
                          <FaEye />
                        </button>
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
                    <p>
                      Try adjusting your search to find what you're looking for.
                    </p>
                  </div>
                )}
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
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
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
            ) : (
              <div className="table-responsive">
                <MDBTable>
                  <MDBTableHead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          style={{ transform: "scale(1.5)", cursor: "pointer" }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedExpenses(
                                currentExpenses.map((expense) => expense.id)
                              );
                            } else {
                              setSelectedExpenses([]);
                            }
                          }}
                          checked={
                            currentExpenses.length > 0 &&
                            currentExpenses.every((expense) =>
                              selectedExpenses.includes(expense.id)
                            )
                          }
                        />
                      </th>
                      {/* <th>Bill Photo</th> */}
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {currentExpenses.length > 0 ? (
                      currentExpenses.map((expense, index) => (
                        <tr key={expense.id}>
                          <td data-label="Select">
                            <input
                              type="checkbox"
                              style={{
                                transform: "scale(1.5)",
                                cursor: "pointer",
                              }}
                              onChange={(e) =>
                                handleCheckboxChange(e, expense.id)
                              }
                              checked={selectedExpenses.includes(expense.id)}
                            />
                          </td>
                          {/* <td data-label="Bill Photo">
                            {expense.imageUrl ? (
                              <img
                                src={expense.imageUrl}
                                alt="Bill"
                                width="50"
                                onClick={() =>
                                  handleImageClick(expense.imageUrl)
                                }
                                style={{ cursor: "pointer" }}
                              />
                            ) : (
                              <img
                                src={defaultImage}
                                alt="Bill"
                                width="50"
                                onClick={() =>
                                  handleImageClick(expense.imageUrl)
                                }
                                style={{ cursor: "pointer" }}
                              />
                            )}
                          </td> */}
                          <td data-label="Title">{expense.title}</td>
                          <td data-label="Amount">₹{expense.amount}</td>
                          <td data-label="Type">{expense.transactionType}</td>
                          <td data-label="Category">{expense.category}</td>
                          <td data-label="Date">{expense.date}</td>
                          <td data-label="Actions">
                            <>
                              <OverlayTrigger
                                placement="bottom"
                                popperConfig={{
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: { offset: [0, 0] },
                                    },
                                  ],
                                }}
                                delay={{ show: 100, hide: 100 }}
                                overlay={(props) =>
                                  renderTooltip(props, "View")
                                }
                                show={!isSidebarVisible ? undefined : false}
                              >
                                <button
                                  className="btn btn-secondary action-btn"
                                  onClick={() => handleViewClick(expense)}
                                >
                                  <FaEye />
                                </button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="bottom"
                                popperConfig={{
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: { offset: [0, 0] },
                                    },
                                  ],
                                }}
                                delay={{ show: 100, hide: 100 }}
                                overlay={(props) =>
                                  renderTooltip(props, "Edit")
                                }
                                show={!isSidebarVisible ? undefined : false}
                              >
                                <button
                                  className="btn btn-primary action-btn"
                                  onClick={() => handleEditClick(expense)}
                                >
                                  <FaEdit />
                                </button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="bottom"
                                popperConfig={{
                                  modifiers: [
                                    {
                                      name: "offset",
                                      options: { offset: [0, 0] },
                                    },
                                  ],
                                }}
                                delay={{ show: 100, hide: 100 }}
                                overlay={(props) =>
                                  renderTooltip(props, "Delete")
                                }
                                show={!isSidebarVisible ? undefined : false}
                              >
                                <button
                                  className="btn btn-danger action-btn"
                                  onClick={() => handleDeleteClick(expense.id)}
                                >
                                  <FaTrashAlt />
                                </button>
                              </OverlayTrigger>
                            </>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8">
                          <div
                            style={{ textAlign: "center", margin: "50px 0" }}
                          >
                            <img
                              src="https://indiaai.gov.in/indiaAi-2021/build/images/Listing-page/gif/no-result.gif"
                              alt="No results"
                              style={{ maxWidth: "150px", marginBottom: "0px" }}
                            />
                            <h4>No Results Found</h4>
                            <p>
                              Try adjusting your search to find what you&apos;re
                              looking for.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </MDBTableBody>
                </MDBTable>

                {/* Add Pagination */}
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
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
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
        </div>
      </div>

      {/* selectedImage */}

      {selectedImage && (
        <div
          className="modal"
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

      {editingExpense && (
        <div
          className="modal "
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Expense</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={() => setEditingExpense(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-controls"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-controls"
                      name="amount"
                      value={editForm.amount}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-controls"
                      name="transactionType"
                      value={editForm.transactionType}
                      onChange={handleEditChange}
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      type="text"
                      className="form-controls"
                      name="category"
                      value={editForm.category}
                      onChange={handleEditChange}
                    >
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
                      <option value="charitablegiving">
                        Charitable Giving
                      </option>
                      <option value="allowance">Allowance</option>
                      <option value="business">Business</option>
                      <option value="subscription/strimingservices">
                        Subscription/Streaming Services
                      </option>
                      <option value="veg">Veg</option>
                      <option value="foodexpenses">Food expenses</option>
                      <option value="investmentincome">
                        Investment Income
                      </option>
                      <option value="gifts">Gifts</option>
                      <option value="pension">Pension</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-controls"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input
                      className="form-controls"
                      value={editForm.time}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Remark</label>
                    <input
                      className="form-controls"
                      type="transactionType"
                      name="remark"
                      value={editForm.remark}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bill Photo</label>
                    <input
                      type="file"
                      className="form-controls"
                      onChange={handleFileChange}
                      alt=""
                    />
                    {imageLoading && (
                      <div>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></span>
                        <span>Uploading...</span>
                      </div>
                    )}
                    {(localImageUrl || editForm.imageUrl) && (
                      <div>
                        <img
                          src={localImageUrl || editForm.imageUrl}
                          alt="Bill Preview"
                          style={{ width: "100px", marginTop: "10px" }}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer ">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingExpense(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditSubmit}
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
                    </span>
                  ) : (
                    "Save Changes"
                  )}
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
                <h5 className="modal-title">Confirm Expense Deletion</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={cancelDeleteExpense}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this expense?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDeleteExpense}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDeleteExpense}
                  disabled={loading}
                >
                  {loading ? (
                    <ThreeCircles color="white" height={15} width={15} />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteConfirmation && (
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
                <h5 className="modal-title">Confirm Expense Deletion</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={cancelBulkDelete}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete these expenses?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelBulkDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmBulkDelete}
                  disabled={loading}
                >
                  {loading ? (
                    <ThreeCircles color="white" height={15} width={15} />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedViewExpense && (
        <div
          className="modal"
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
                      selectedViewExpense.imageUrl ? "col" : "col-md-12"
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
    </div>
  );
};
export default Expense_List;
