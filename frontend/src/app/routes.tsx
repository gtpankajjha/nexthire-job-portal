import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '../../types';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { LoginPage, RegisterPage } from '../features/auth/pages';
import { HomePage, SearchPage, JobDetailsPage } from '../features/jobs/pages';
import { SeekerProfile, SeekerApplications, SeekerSavedJobs } from '../features/candidate/pages';
import { EmployerDashboard, ManageJobs, PostJob, JobApplicants, EmployerCompanyProfile } from '../features/employer/pages';
import { AdminDashboard } from '../features/admin/pages';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/jobs/:id" element={<JobDetailsPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route path="/seeker/profile" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerProfile /></ProtectedRoute>} />
    <Route path="/seeker/applications" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerApplications /></ProtectedRoute>} />
    <Route path="/seeker/saved" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerSavedJobs /></ProtectedRoute>} />

    <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><EmployerDashboard /></ProtectedRoute>} />
    <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><ManageJobs /></ProtectedRoute>} />
    <Route path="/employer/post-job" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><PostJob /></ProtectedRoute>} />
    <Route path="/employer/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><JobApplicants /></ProtectedRoute>} />
    <Route path="/employer/company" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><EmployerCompanyProfile /></ProtectedRoute>} />

    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);