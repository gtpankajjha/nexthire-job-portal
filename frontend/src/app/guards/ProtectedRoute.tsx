import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../../types';
import { useAuth } from '../../features/auth/context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};