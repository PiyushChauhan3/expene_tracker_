import { useState, useEffect } from "react";
import { HashRouter as Router , Routes, Route, useLocation, Navigate } from "react-router-dom";

import Profile from "./Profile";
import Navbar from "./Component/navbar/Navbar";
import Login from "./Component/sidebar/AdminLogin";
import Footer from "./Component/Footer/Footer";
import Register from "./Component/sidebar/AdminRegister";
import Dashboard from "./Component/sidebar/Home/Dashboard";
import Editprofile from "./Component/sidebar/Home/Editprofile";
import Changepassword from "./Component/sidebar/Home/Changepassword";
import Viewexpress from "./Component/sidebar/Home/Viewexpress";
// import Employeeprofile from "./Component/sidebar/Home/TransactionHistory";
import Addemployee from "./Component/sidebar/Addemployee";
import EmployeeLedger from "./Component/sidebar/EmployeeLedger";
import Contact from "./Component/Contact/Contact";
import Logout from "./Component/sidebar/Home/Logout";
import Expense_List from "./Expense_List";
import Employee from "./Employee";
import Employee_list from "./Employee_list";
import Add_Expenses from "./Add_Expenses";
import RateUs from "./RateUs";
import AboutUs from "./AboutUs";
import AdminAndEmployeeLogin from "./AdminAndEmployeeLogin";
import Forget from "./Forget";
// import ProtectedRoute from "./ProtectedRoute";
import EmployeeLogin from "./EmployeeLogin";
// import EmployeeAddExpense from "./EmployeeAddExpense";
import EmployeeExpensesList from "././EmployeeExpensesList";
import EmployeeChangePassword from "./EmployeeChangePassword";
import { AuthProvider, useAuth } from "./AuthContext";
import Side from "./Component/sidebar/Side";
import EmployeeEditProfile from "./Component/sidebar/Home/EmployeeEditProfile";
import EmployeeExpense from "./EmployeeExpense";
// import LandingPage from "./components/LandingPage";
import LoadingSpinner from "./Component/LoadingSpinner";
import AddTestExpenses from "./AddTestExpenses";

const App = () => {
  const location = useLocation();
  const [status] = useState("default");
  const { currentUser, loading } = useAuth(); // Include loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    
    console.log("Current User:", currentUser);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentUser]);

 

  // Updated hideNavbar condition - removed aboutus, contact, rateus from the list
  const hideNavbar =
    location.pathname === "/home" ||
    location.pathname === "/adminregister" ||
    location.pathname === "/forget" ||
    location.pathname === "/adminlogin" ||
    location.pathname === "/EmployeeLogin" ||
    location.pathname === "/login_signup_page" ||
    location.pathname === "/share"; 

  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div data-sidebar-size={status}>
      {!hideNavbar && <Side isSidebarVisible={isSidebarVisible} />}
      {!hideNavbar && <Navbar toggleSidebar={toggleSidebar} />}
      <Routes >
        {/* Public routes
        <Route path="/home" element={<LandingPage />} /> */}
        {/* <Route 
          path="/login_signup_page" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AdminAndEmployeeLogin />
            )
          } 
        /> */}
        <Route 
  path="/login_signup_page" 
  
  element={<>
    {console.log("Rendering AdminAndEmployeeLogin")}
  <AdminAndEmployeeLogin />
  </>
  } 
/>
        <Route path="/adminlogin" element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route path="/adminregister" element={<Register />} />
        <Route path="/forget" element={<Forget />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rateus" element={<RateUs />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Employee/EmployeeChangePassword" element={<EmployeeChangePassword/>} />
        <Route path="/:employeeId" element={<EmployeeExpense />} />
        <Route path="/EmployeeExpensesList" element={<EmployeeExpensesList />}  />
        <Route path="/EmployeeLogin" element={<EmployeeLogin />} />
        <Route path="/adminlogin" element={<Login />} />
        <Route path="/editprofile" element={<Editprofile />} />
        <Route path="/changepassword" element={<Changepassword />} />
        <Route path="/viewexpress" element={<Viewexpress />} />
        <Route path="/employeeeditprofile" element={<EmployeeEditProfile />} />
        <Route path="/addemployee" element={<Addemployee />} />
        <Route path="/employeeledger" element={<EmployeeLedger />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/expense_list" element={<Expense_List />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/employee_list" element={<Employee_list />} />
        <Route path="/addexpenses" element={<Add_Expenses />} />
        <Route path="/add-test-expenses" element={<AddTestExpenses />} />
      </Routes>
      {!hideNavbar && <Footer />}
    </div>
  );
};

// Wrap App component in BrowserRouter in a separate component
const AppWrapper = () => (
  <AuthProvider>
  <Router > 
    <App />
  </Router >
  </AuthProvider>
);

export default AppWrapper;
