import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User as UserIcon, LogOut, Menu, X, LayoutDashboard, FileText, Bookmark, Settings, Building } from 'lucide-react';
import { useAuth } from './App';
import { UserRole } from './types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      <Link to="/search" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Find Jobs</Link>
      {user?.role === UserRole.EMPLOYER && (
        <Link to="/employer/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Employer Dashboard</Link>
      )}
      {user?.role === UserRole.ADMIN && (
        <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Admin Panel</Link>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NextHire</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <NavLinks />
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 focus:outline-none">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      {user.role === UserRole.SEEKER && (
                        <>
                          <Link to="/seeker/profile" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserIcon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Profile</Link>
                          <Link to="/seeker/applications" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FileText className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Applications</Link>
                          <Link to="/seeker/saved" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Bookmark className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Saved Jobs</Link>
                        </>
                      )}
                      {user.role === UserRole.EMPLOYER && (
                        <>
                          <Link to="/employer/dashboard" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><LayoutDashboard className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Dashboard</Link>
                          <Link to="/employer/jobs" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Briefcase className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Manage Jobs</Link>
                          <Link to="/employer/company" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><Building className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" /> Company Profile</Link>
                        </>
                      )}
                    </div>
                    <div className="py-1">
                      <button onClick={handleLogout} className="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"><LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500" /> Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Log in</Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLinks />
            {!user && (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Log in</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-gray-50">Sign up</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-white py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <Briefcase className="h-6 w-6 text-primary-500" />
            <span className="ml-2 text-xl font-bold">NextHire</span>
          </div>
          <p className="text-gray-400 text-sm">Connecting top talent with the best companies worldwide. Your next career move starts here.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">For Candidates</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/search" className="hover:text-white">Browse Jobs</Link></li>
            <li><Link to="/register" className="hover:text-white">Create Profile</Link></li>
            <li><Link to="#" className="hover:text-white">Job Alerts</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">For Employers</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/register" className="hover:text-white">Post a Job</Link></li>
            <li><Link to="#" className="hover:text-white">Search Resumes</Link></li>
            <li><Link to="#" className="hover:text-white">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
            <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} NextHire. All rights reserved.
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow flex flex-col">
      {children}
    </main>
    <Footer />
  </div>
);

// --- Sidebar Layout for Dashboards ---
export const DashboardLayout: React.FC<{ children: React.ReactNode, sidebarLinks: {to: string, icon: any, label: string}[] }> = ({ children, sidebarLinks }) => {
  const location = useLocation();
  return (
    <div className="flex-grow flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <nav className="p-4 space-y-1">
          {sidebarLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-700' : 'text-gray-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};
