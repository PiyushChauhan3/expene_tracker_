import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ requiredAdminDocid, element }) => {
  const AdminDocid = localStorage.getItem("adminDocId");

  // If the adminDocId doesn't match the required one, redirect to home ("/")
  if (AdminDocid !== requiredAdminDocid) {
    return ((
      <div style={{marginLeft:"700px", marginTop:"400px"}}>
        <h1>You do not have permission to access this page.</h1>
      
        
      </div>
    ));
  }

  // If the adminDocId matches, render the passed component (element)
  return element;
};

export default ProtectedRoute;
