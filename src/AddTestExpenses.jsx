import React from "react";
import { db } from "./Firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import Swal from "sweetalert2";

const AddTestExpenses = () => {
  const { currentUser } = useAuth();
  const role = localStorage.getItem("Role");

  const addTestExpenses = async () => {
    const userId = localStorage.getItem( role=== "admin" ? "adminDocId" :"EmployeeDocId");

    if (!userId) {
      Swal.fire("Error", "Employee ID not found. Please login again.", "error");
      return;
    }

    let expenseCollectionRef = collection(db, `Users/${userId}/expense`);
    if (role === "admin") {
      const adminExpenseCollectionRef = collection(db, `Admin/${userId}/expense`);
      expenseCollectionRef = adminExpenseCollectionRef;
    }

    const expenses = [];

    for (let i = 25; i < 75; i++) {
      expenses.push({
        title: `Test Expense ${i + 1}`,
        amount: Math.floor(Math.random() * 1000) + 1,
        transactionType: "credit",
        category: "test",
        date: `2025-01-${String(i % 31 + 1).padStart(2, '0')}`,
        time: new Date().toLocaleTimeString(),
        remark: `This is a test expense ${i + 1}`,
        imageUrl: "",
        createdAt: serverTimestamp(),
        status: "pending",
      });
    }

    try {
      for (const expense of expenses) {
        await addDoc(expenseCollectionRef, expense);
      }
      Swal.fire("Success", "Test expenses added successfully!", "success");
    } catch (error) {
      console.error("Error adding test expenses:", error);
      Swal.fire("Error", "Failed to add test expenses. Please try again.", "error");
    }
  };

  const addTestEmployee = async () => {
    const adminId = localStorage.getItem("adminDocId");

    if (!adminId) {
      Swal.fire("Error", "Admin ID not found. Please login again.", "error");
      return;
    }

    const employeeCollectionRef = collection(db, "Users");
    const employees = [];

    for (let i = 0; i < 50; i++) {
      employees.push({
        username: `Test Employee ${i + 1}`,
        email: `testemployee${i + 1}@example.com`,
        mobile: `123456789${i}`,
        password: "password123",
        roll: "employee",
        isActive: true,
        employee_logo: "",
        adminId: adminId,
        createdAt: serverTimestamp(),
      });
    }

    try {
      for (const employee of employees) {
        await addDoc(employeeCollectionRef, employee);
      }
      Swal.fire("Success", "Test employees added successfully!", "success");
    } catch (error) {
      console.error("Error adding test employees:", error);
      Swal.fire("Error", "Failed to add test employees. Please try again.", "error");
    }
  };

  return (
    <div style={{
    marginTop:"50vh",
    marginLeft:"50vh"
    }}>
      <button onClick={addTestExpenses} className="btn btn-primary">
        Add Test Expenses
      </button>
      <button onClick={addTestEmployee} className="btn btn-secondary">
        Add Test Employees
      </button>
    </div>
  );
};

export default AddTestExpenses;