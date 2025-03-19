import { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { FaEdit, FaTrashAlt, FaDownload, FaEye } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { useAuth } from "./AuthContext";
import "./styles/EmployeeExpensesList.css?v=2.2.2.2";
import { Link } from "react-router-dom";
import LoadingSpinner from "./Component/LoadingSpinner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Swal from "sweetalert2";
import DefaultBillImage from "./bill-def-img.png";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const EmployeeExpensesList = () => {
  const [searchData, setSearchData] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    amount: "",
    transactionType: "",
    category: "",
    date: "",
    status: "",
    imageUrl: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const { isSidebarVisible } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLoading, setEditingLoading] = useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewExpense, setSelectedViewExpense] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!adminId) return;
      setLoading(true);
      try {
        const querySnapshot = await getDocs(
          collection(db, `Users/${adminId}/expense`)
        );
        const expenseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(expenseList);
      } catch (error) {
        console.error("Error fetching expense:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [adminId]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAdminId(user.uid);
      } else {
        setLoading(false);
        setExpenses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    setSearchData(e.target.value);
  };

  const filterExpenses = expenses.filter((expense) => {
    const searchValue = searchData.toLowerCase();
    return (
      expense.title?.toLowerCase().includes(searchValue) ||
      expense.amount?.toString().toLowerCase().includes(searchValue) ||
      expense.category?.toLowerCase().includes(searchValue) ||
      expense.transactionType?.toLowerCase().includes(searchValue)
    );
  });

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowViewModal(false);
  };
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setEditForm({ ...expense });
    setImagePreview(expense.imageUrl);
  };

  const [localImageFile, setLocalImageFile] = useState(null);

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageUrl" && files.length > 0) {
      const file = files[0];
      setLocalImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async () => {
    if (editingExpense) {
      setEditingLoading(true);
      const expenseDoc = doc(db, `Users/${adminId}/expense`, editingExpense.id);

      try {
        const updateData = {
          title: editForm.title,
          amount: editForm.amount,
          transactionType: editForm.transactionType,
          category: editForm.category,
          date: editForm.date,
          status: editForm.status,
        };

        // Upload image if a new one was selected
        if (localImageFile) {
          setUploadingImage(true);
          const formData = new FormData();
          formData.append("file", localImageFile);
          formData.append("upload_preset", "ml_default");

          const response = await fetch(
            "https://api.cloudinary.com/v1_1/due0loh2v/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Image upload failed");
          }

          const data = await response.json();
          updateData.imageUrl = data.secure_url;
        }

        // Update in Firebase
        await updateDoc(expenseDoc, updateData);

        // Update local state
        setExpenses((prev) =>
          prev.map((exp) =>
            exp.id === editingExpense.id ? { ...exp, ...updateData } : exp
          )
        );

        // Reset states
        setEditingExpense(null);
        setImagePreview(null);
        setLocalImageFile(null);
      } catch (error) {
        console.error("Error updating expense:", error);
      } finally {
        setEditingLoading(false);
        setUploadingImage(false);
      }
    }
  };

  const handleDeleteClick = (id) => {
    setExpenseToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleCheckboxChange = (expenseId) => {
    setSelectedExpenses((prev) => {
      if (prev.includes(expenseId)) {
        return prev.filter((id) => id !== expenseId);
      } else {
        return [...prev, expenseId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedExpenses(currentExpenses.map((expense) => expense.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleViewClick = (expense) => {
    setSelectedViewExpense(expense);
    setShowViewModal(true);
  };

  const handleBulkDelete = () => {
    setExpenseToDelete(selectedExpenses);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteExpense = async () => {
    try {
      if (Array.isArray(expenseToDelete)) {
        // Bulk delete
        await Promise.all(
          expenseToDelete.map((id) =>
            deleteDoc(doc(db, `Users/${adminId}/expense`, id))
          )
        );
        setExpenses((prev) =>
          prev.filter((expense) => !expenseToDelete.includes(expense.id))
        );
        setSelectedExpenses([]);
      } else {
        // Single delete
        await deleteDoc(doc(db, `Users/${adminId}/expense`, expenseToDelete));
        setExpenses((prev) =>
          prev.filter((expense) => expense.id !== expenseToDelete)
        );
      }
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting expense(s):", error);
    }
  };

  const renderTooltip = (props, label) => (
    <Tooltip id="button-tooltip" {...props}>
      {label}
    </Tooltip>
  );

  const cancelDeleteExpense = () => {
    setShowDeleteConfirmation(false);
  };

  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = filterExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const pageNumbers = Array.from(
    { length: Math.ceil(filterExpenses.length / itemsPerPage) },
    (_, i) => i + 1
  );

  const renderExpenseItem = (expense) => (
    <tr key={expense.id}>
      <td>
        <input
          type="checkbox"
          style={{
            color: "blueviolet",
          }}
          checked={selectedExpenses.includes(expense.id)}
          onChange={() => handleCheckboxChange(expense.id)}
          className="form-check-input"
        />
      </td>
      {/* <td>
        {expense.imageUrl ? (
          <img
            src={expense.imageUrl}
            alt="Bill"
            width="50"
            style={{ cursor: "pointer" }}
            onClick={() => handleImageClick(expense.imageUrl)}
          />
        ) : (
          <img
            src={DefaultBillImage}
            alt="Bill"
            width="50"
            onClick={() => handleImageClick(expense.imageUrl)}
            style={{ cursor: "pointer" }}
          />
        )}
      </td> */}
      <td>{expense.title}</td>
      <td>{expense.amount}</td>
      <td>{expense.transactionType}</td>
      <td>{expense.category}</td>
      <td>{expense.date}</td>
      <td>
        <div className={`status-badge status-${expense.status?.toLowerCase()}`}>
          {expense.status}
        </div>
      </td>
      <td>
        <OverlayTrigger
          placement="bottom"
          popperConfig={{
            modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
          }}
          delay={{ show: 100, hide: 100 }}
          overlay={(props) => renderTooltip(props, "View")}
          show={!isSidebarVisible ? undefined : false}
        >
          <button
            className="view-button"
            onClick={() => handleViewClick(expense)}
          >
            <FaEye />
          </button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="bottom"
          popperConfig={{
            modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
          }}
          delay={{ show: 100, hide: 100 }}
          overlay={(props) => renderTooltip(props, "Edit")}
          show={!isSidebarVisible ? undefined : false}
        >
          <button
            onClick={() => handleEditClick(expense)}
            className="edit-button"
          >
            <FaEdit />
          </button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          popperConfig={{
            modifiers: [{ name: "offset", options: { offset: [0, 0] } }],
          }}
          delay={{ show: 100, hide: 100 }}
          overlay={(props) => renderTooltip(props, "Delete")}
          show={!isSidebarVisible ? undefined : false}
        >
          <button
            onClick={() => handleDeleteClick(expense.id)}
            className="delete-button"
          >
            <FaTrashAlt />
          </button>
        </OverlayTrigger>
      </td>
    </tr>
  );

  const closeModal = () => setSelectedImage(null);

  const renderMobileView = (expense) => (
    <div key={expense.id} className="expense-card">
      <div className="expense-card-header">
        <div className="expense-card-title">{expense.title}</div>
      </div>
      <div className="expense-card-body">
        <div className="expense-card-image">
          {expense.imageUrl ? (
            <img
              src={expense.imageUrl}
              alt="Bill"
              onClick={() => handleImageClick(expense.imageUrl)}
            />
          ) : (
            <img
              src={DefaultBillImage}
              alt="Bill"
              width="50"
              onClick={() => handleImageClick(expense.imageUrl)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <div className="expense-card-details">
          <div className="detail-item">
            <span className="detail-label">Amount:</span>
            <span className="detail-value">{expense.amount}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{expense.transactionType}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{expense.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{expense.date}</span>
          </div>
          <div
            className={`status-badge status-${expense.status?.toLowerCase()}`}
          >
            {expense.status}
          </div>
        </div>
      </div>
      <div className="expense-card-actions">
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
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  const handleDownloadClick = () => {
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
              </div>
              <div style="display: flex; justify-content: center; gap: 10px;">
                <button class="btn btn-primary" onclick="window.openSelected()">Open</button>
                <button class="btn btn-success" onclick="window.downloadSelected()">Download</button>
              </div>
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
      if (!adminId) {
        console.error("Admin ID is not set");
        return;
      }
      const pdfDoc = new jsPDF();
      pdfDoc.setFontSize(22);
      pdfDoc.text("Expense Summary", pdfDoc.internal.pageSize.width / 2, 20, {
        align: "center",
      });

      const role = localStorage.getItem("Role");
      let username = "Employee";
      let email = "NA";

      if (role === "employee") {
        const empId = localStorage.getItem("EmployeeDocId");
        const docref = doc(db, "Users", empId);
        const docSnap = await getDoc(docref);
        username = docSnap.exists() ? docSnap.data().username : "Employee";
        email = docSnap.exists() ? docSnap.data().email : "NA";
      }

      pdfDoc.setFontSize(12);
      pdfDoc.text(`Name: ${username}`, pdfDoc.internal.pageSize.width / 2, 26, {
        align: "center",
      });
      pdfDoc.text(`Email: ${email}`, pdfDoc.internal.pageSize.width / 2, 31, {
        align: "center",
      });
      pdfDoc.text(
        `Date: ${new Date().toLocaleDateString()}`,
        pdfDoc.internal.pageSize.width / 2,
        36,
        { align: "center" }
      );
      pdfDoc.text(
        `Total Expenses: ${expenses.length}`,
        pdfDoc.internal.pageSize.width / 2,
        41,
        { align: "center" }
      );
      if (!expenses) {
        console.error("No expenses available to generate PDF");
        return;
      }
      const totalAmount = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );
      pdfDoc.text(
        `Total Amount: ${totalAmount.toFixed(2)}`,
        pdfDoc.internal.pageSize.width / 2,
        46,
        { align: "center" }
      );
      pdfDoc.autoTable({
        startY: 54,
        head: [["Title", "Amount", "Type", "Category", "Date", "Status"]],
        body: expenses.map((exp) => [
          exp.title || "",
          exp.amount?.toString() || "",
          exp.transactionType || "",
          exp.category || "",
          exp.date || "",
          exp.status || "",
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
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
      });
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
        const blob = pdfDoc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const generateExcel = async (action) => {
    try {
      const totalAmount = expenses.reduce(
        (sum, exp) => sum + parseFloat(exp.amount || 0),
        0
      );
      const workbook = XLSX.utils.book_new();
      const headerData = [
        ["Expense Summary"],
        [],
        [`Date: ${new Date().toLocaleDateString()}`],
        [`Total Expenses: ${expenses.length}`],
        [`Total Amount: ${totalAmount.toFixed(2)}`],
        [],
        ["Title", "Amount", "Type", "Category", "Date", "Status"],
      ];
      const expenseData = expenses.map((exp) => [
        exp.title || "",
        exp.amount || "",
        exp.transactionType || "",
        exp.category || "",
        exp.date || "",
        exp.status || "",
      ]);
      const allData = [...headerData, ...expenseData];
      const worksheet = XLSX.utils.aoa_to_sheet(allData);
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
      const colWidths = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet["!cols"] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      if (action === "download") {
        XLSX.writeFile(workbook, "expense_report.xlsx");
      } else {
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
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={`expense-list-container container-larger ${
        isSidebarVisible ? "sidebar-open" : " "
      }`}
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
                    value={searchData}
                  />
                  {searchData && (
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
                      onClick={() => setSearchData("")}
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
                  overlay={(props) => renderTooltip(props, "Delete Selected")}
                >
                  <span>
                    {selectedExpenses.length >= 0 && (
                      <button
                        className="btn btn-danger"
                        onClick={handleBulkDelete}
                        disabled={
                          selectedExpenses.length === 0 ||
                          selectedExpenses.length === 1
                        }
                      >
                        <FaTrashAlt /> ({selectedExpenses.length})
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
                      onClick={handleDownloadClick}
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
                {/* <div className="expense-summary">
                  <span>Total Expenses:</span>
                  <span className="amount">
                    {expenses
                      .reduce(
                        (total, expense) =>
                          total + (parseFloat(expense.amount) || 0),
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div> */}
              </div>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
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
            <div className="summary-item">
              <span className="summary-label">Rejected:</span>
              <span className="summary-value rejected">
                {expenses
                  .filter((expense) => expense.status === "Rejected")
                  .reduce(
                    (total, expense) =>
                      total + (parseFloat(expense.amount) || 0),
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total:</span>
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
          {isMobile ? (
            <div className="expenses-grid">
              {currentExpenses.map(renderMobileView)}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedExpenses.length === currentExpenses.length
                        }
                        className="form-check-input"
                      />
                    </th>
                    {/* <th>Bill Photo</th> */}
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{currentExpenses.map(renderExpenseItem)}</tbody>
              </table>
            </div>
          )}
          <div className="pagination-container">
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
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <div
          className="modal "
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          {" "}
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header text-light">
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
                      className="form-control"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={editForm.amount}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-control"
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
                      className="form-control"
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
                      className="form-control"
                      style={{
                        display: "flex",
                        justifyContent: "left",
                      }}
                      name="date"
                      value={editForm.date}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bill Photo</label>
                    <input
                      type="file"
                      className="form-control"
                      name="imageUrl"
                      onChange={handleEditChange}
                      accept="image/*"
                    />
                    {imagePreview && (
                      <div className="image-preview mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: "200px", height: "auto" }}
                        />
                      </div>
                    )}
                    {uploadingImage && (
                      <div className="upload-status mt-2">
                        <div className="loader-spinner"></div>
                        <span>Uploading image...</span>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
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
                  disabled={editingLoading || uploadingImage}
                >
                  {editingLoading ? "Updating..." : "Update Expense"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div
          className="modal "
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          {" "}
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="close-button"
                  onClick={cancelDeleteExpense}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body  text-dark">
                Are you sure you want to delete this expense?
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
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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
                    <div className="modal-res1 col-md-6 text-center">
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
                      selectedViewExpense.imageUrl ? "col-lg-6" : "col-md-12"
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

export default EmployeeExpensesList;
