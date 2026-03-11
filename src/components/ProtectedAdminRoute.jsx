import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedAdminRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" />;
  }

  // For now, we're allowing any authenticated user to access admin
  // You can add additional admin role checking logic here
  // For example, check if user email matches admin emails or check user role in database

  return children;
}

export default ProtectedAdminRoute;
