
// import React from "react";
// import { Navigate } from "react-router-dom";


// const ProtectedRoute = ({ children }) => {

//  const isAuthenticated = localStorage.getItem("token");

// // if(!isAuthenticated){
// // return <Navigate to='/'></Navigate>
// // }

// return isAuthenticated ? children : <Navigate to="/" />;

 
//   return children;
// };

// export default ProtectedRoute;

import React from "react";
import { Redirect, Route } from "react-router-dom";
import { useAuth } from "./AuthContext";

// import React from "react";
import { Navigate, Route } from "react-router-dom";


const ProtectedRoute = ({ requiredAdminDocid, element, ...rest }) => {
  const AdminDocid = localStorage.getItem("adminDocId");


  if (AdminDocid !== requiredAdminDocid) {
    return <Navigate to="/" />;
  }

  return <Route {...rest} element={element} />;
};

export default ProtectedRoute;
