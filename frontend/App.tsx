import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { User, UserRole } from './types';
import { authService } from './services';
import { Layout } from './layout';
import { HomePage, SearchPage, JobDetailsPage, LoginPage, RegisterPage } from './public-pages';
import { SeekerProfile, SeekerApplications, SeekerSavedJobs } from './seeker-pages';
import { EmployerDashboard, ManageJobs, PostJob, JobApplicants, EmployerCompanyProfile } from './employer-pages';
import { AdminDashboard } from './admin-pages';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  register: (data: any, password?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await authService.getCurrentUser(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (data: any, password?: string) => {
    const u = await authService.register(data, password);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- Route Guards ---
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// --- Main App ---
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Seeker Routes */}
            <Route path="/seeker/profile" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerProfile /></ProtectedRoute>} />
            <Route path="/seeker/applications" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerApplications /></ProtectedRoute>} />
            <Route path="/seeker/saved" element={<ProtectedRoute allowedRoles={[UserRole.SEEKER]}><SeekerSavedJobs /></ProtectedRoute>} />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/jobs" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><ManageJobs /></ProtectedRoute>} />
            <Route path="/employer/post-job" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><PostJob /></ProtectedRoute>} />
            <Route path="/employer/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><JobApplicants /></ProtectedRoute>} />
            <Route path="/employer/company" element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}><EmployerCompanyProfile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
