// import { createContext, useContext, useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const storeToken = (userToken) => {
//     localStorage.setItem("token", userToken); // Store the token
//     setIsAuthenticated(true); // Update state after storing token
//   };

//   // Function to log out (remove the token from localStorage)
//   const logout = () => {
//     localStorage.removeItem("token");
   
//     setIsAuthenticated(false); // Update the state to reflect logged out status
//     navigate("/");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, storeToken, logout, setIsAuthenticated }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const authContextValue = useContext(AuthContext);

//   if (!authContextValue) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return authContextValue;
// };




import { createContext, useContext, useState } from "react";


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(  localStorage.getItem("token") !== null );

const [admindocid , setAdmindocid] = useState(localStorage.getItem("adminDocId"));

const [practice , setPractice] = useState("1234")

  const [user , setUser] = useState(null);

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    company_name: "",
    phone: "",
    company_address: "",
    role: "",
    company_logo: "",
  });


  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };


  


  const login = (userData) => setUser(userData);


  const storeToken = (userToken) => {
    localStorage.setItem("token", userToken);   // Store the token
    setIsAuthenticated(true);                  // Update state after storing token
  };

  const Logout = () => setUser(null); // Call this to log out

  // Function to log out (remove the token from localStorage)
  const logout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("adminDocId")
    localStorage.removeItem("EmployeeDocId")
    localStorage.removeItem("Role")
    localStorage.removeItem("adminId")
    localStorage.removeItem("employee")
    setIsAuthenticated(false); // Update the state to reflect logged out status
    setUser(null); // Clear user data
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, storeToken, logout, setIsAuthenticated ,user , practice , login , Logout ,  admindocid , 
        isSidebarVisible, setSidebarVisible,toggleSidebar , userData, setUserData
       }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextValue = useContext(AuthContext);

  if (!authContextValue) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return authContextValue;

};
