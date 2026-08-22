import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../../types';
import { useAuth } from '../../features/auth/context/AuthContext';

export const getRoleDestination = (role: UserRole): string => {
  if (role === UserRole.ADMIN) return '/admin/dashboard';
  if (role === UserRole.EMPLOYER) return '/employer/dashboard';
  return '/search';
};

export const AuthLoadingState: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Loading...</div>
);

export const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, authInitialized } = useAuth();

  if (!authInitialized) return <AuthLoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={getRoleDestination(user.role)} replace />;

  return <>{children}</>;
};