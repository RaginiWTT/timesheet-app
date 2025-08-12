// src/components/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("accessToken");
  const userRole = localStorage.getItem("roleName");

  if (!token) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(userRole)) {
    // Logged in but role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
