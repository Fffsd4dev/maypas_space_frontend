import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/useAuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;