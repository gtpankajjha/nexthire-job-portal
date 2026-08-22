import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../../types';
import { useAuth } from '../../features/auth/context/AuthContext';
import { AuthLoadingState, getRoleDestination } from './ProtectedRoute';

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authInitialized } = useAuth();

  if (!authInitialized) return <AuthLoadingState />;
  if (user) return <Navigate to={getRoleDestination(user.role)} replace />;

  return <>{children}</>;
};