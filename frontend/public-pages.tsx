import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Briefcase, Building, DollarSign, Clock, ChevronRight, CheckCircle, Filter, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { Button, Input, Card, Badge, JobCard, useToast, Select, Modal, formatINR } from './ui-components';
import { jobService, authService, applicationService, savedJobService } from './services';
import { Job, UserRole, JobType, WorkMode, ApplicationStatus } from './types';
import { useAuth } from './App';
import { CATEGORIES } from './mockData';

// --- Home Page ---
export const HomePage: React.FC = () => {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    jobService.getJobs().then(jobs => setRecentJobs(jobs.slice(0, 6)));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Find the right job for your career</h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">Discover thousands of job opportunities with top companies. Your next big career move is just a search away.</p>
          
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-lg p-2 flex flex-col md:flex-row shadow-lg gap-2">
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-200">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Job title, skills, or company" 
                className="w-full py-3 text-gray-900 focus:outline-none"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="City, state, or remote" 
                className="w-full py-3 text-gray-900 focus:outline-none"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full md:w-auto rounded-md">Search Jobs</Button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/search?keyword=${encodeURIComponent(cat)}`} className="border border-gray-200 rounded-lg p-4 text-center hover:border-primary-500 hover:shadow-md transition-all group">
                <h3 className="font-medium text-gray-900 group-hover:text-primary-600">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recently Posted Jobs</h2>
            <Link to="/search" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">View all <ChevronRight className="w-4 h-4 ml-1" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Search Page ---
export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { user } = useAuth();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Extract params
  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const type = searchParams.get('type') || '';
  const mode = searchParams.get('mode') || '';
  const minSalary = searchParams.get('minSalary') || '';
  const experience = searchParams.get('experience') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const filters = { keyword, location, type, mode, minSalary, experience, sort };
      const results = await jobService.getJobs(filters);
      setJobs(results);
      
      if (user?.role === UserRole.SEEKER) {
        const saved = await savedJobService.getSavedJobs(user.id);
        setSavedJobIds(new Set(saved.map(j => j.id)));
      }
      setLoading(false);
    };
    fetchJobs();
  }, [keyword, location, type, mode, minSalary, experience, sort, user]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setIsMobileFiltersOpen(false);
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user || user.role !== UserRole.SEEKER) return;
    const isSaved = await savedJobService.toggleSave(user.id, jobId);
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  };

  const FilterContent = () => (
    <div className="space-y-5">
      <div className="flex justify-between items-center md:hidden mb-4">
        <h3 className="font-bold text-lg">Filters</h3>
        <button onClick={() => setIsMobileFiltersOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <Input 
          placeholder="Job title, skills, company" 
          value={keyword} 
          onChange={e => handleFilterChange('keyword', e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <Input 
          placeholder="City, state, or remote" 
          value={location} 
          onChange={e => handleFilterChange('location', e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (INR)</label>
        <Input 
          type="number"
          placeholder="e.g. 500000" 
          value={minSalary} 
          onChange={e => handleFilterChange('minSalary', e.target.value)} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience (Years)</label>
        <Input 
          type="number"
          placeholder="e.g. 3" 
          value={experience} 
          onChange={e => handleFilterChange('experience', e.target.value)} 
        />
      </div>
      <div>
        <Select 
          label="Job Type"
          value={type}
          onChange={e => handleFilterChange('type', e.target.value)}
          options={Object.values(JobType).map(t => ({ value: t, label: t }))}
        />
      </div>
      <div>
        <Select 
          label="Work Mode"
          value={mode}
          onChange={e => handleFilterChange('mode', e.target.value)}
          options={Object.values(WorkMode).map(m => ({ value: m, label: m }))}
        />
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={clearFilters}>Clear All Filters</Button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Mobile Header & Filter Toggle */}
      <div className="md:hidden flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            {loading ? 'Searching...' : `${jobs.length} Jobs Found`}
          </h1>
          <Button variant="outline" size="sm" onClick={() => setIsMobileFiltersOpen(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
          <select 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
            value={sort}
            onChange={e => handleFilterChange('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="salary-desc">Salary: High to Low</option>
            <option value="salary-asc">Salary: Low to High</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-5 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</h3>
            <FilterContent />
          </Card>
        </aside>

        {/* Mobile Sidebar Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFiltersOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white p-6 overflow-y-auto">
              <FilterContent />
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1">
          
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Searching...' : `${jobs.length} Jobs Found`}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white"
                value={sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="salary-desc">Salary: High to Low</option>
                <option value="salary-asc">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Job List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSave={user?.role === UserRole.SEEKER ? () => handleSaveJob(job.id) : undefined}
                  isSaved={savedJobIds.has(job.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We couldn't find any jobs matching your current search criteria. Try adjusting your filters or searching with different keywords.
              </p>
              <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Job Details Page ---
export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      const data = await jobService.getJobById(id);
      setJob(data);
      
      if (user?.role === UserRole.SEEKER && data) {
        const apps = await applicationService.getSeekerApplications(user.id);
        setHasApplied(apps.some(a => a.jobId === data.id));
      }
      setLoading(false);
    };
    fetchJob();
  }, [id, user]);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role !== UserRole.SEEKER) {
      showToast('Only job seekers can apply for jobs.', 'error');
      return;
    }
    
    // Profile completion validation
    const isProfileComplete = !!(
      user.name && 
      user.email && 
      user.phone && 
      user.location && 
      user.totalExperience !== undefined && 
      user.skills && 
      user.skills.length > 0 && 
      user.resumeUrl
    );
    
    if (!isProfileComplete) {
      showToast('Please complete your profile (Phone, Location, Experience, Skills, Resume) before applying.', 'error');
      setTimeout(() => navigate('/seeker/profile'), 2000);
      return;
    }
    
    setShowConfirmModal(true);
  };

  const confirmApply = async () => {
    if (!user || !job) return;

    setApplying(true);
    try {
      await applicationService.apply({
        jobId: job.id,
        seekerId: user.id,
        employerId: job.employerId,
      });
      setHasApplied(true);
      setShowConfirmModal(false);
      showToast('Application submitted successfully!');
    } catch (error: any) {
      showToast(error.message || 'Failed to apply', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" /></div>;
  if (!job) return <div className="p-8 text-center text-xl">Job not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastComponent />
      
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Application">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Applying for</p>
            <p className="font-bold text-gray-900">{job.title} at {job.company}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Candidate:</span> <span className="font-medium">{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-medium">{user?.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Experience:</span> <span className="font-medium">{user?.totalExperience} Years</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Resume:</span> <span className="font-medium text-primary-600 truncate max-w-[200px]">{user?.resumeFileName || 'Attached'}</span></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button onClick={confirmApply} isLoading={applying}>Submit Application</Button>
          </div>
        </div>
      </Modal>

      <Card className="p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="w-16 h-16 rounded-lg object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600 mt-1">{job.company}</p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            {hasApplied ? (
              <Button variant="secondary" className="w-full md:w-auto cursor-default" disabled>
                <CheckCircle className="w-4 h-4 mr-2" /> Applied
              </Button>
            ) : (
              <Button onClick={handleApplyClick} className="w-full md:w-auto">
                Apply Now
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1"/> Location</p>
            <p className="font-medium">{job.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center"><Briefcase className="w-4 h-4 mr-1"/> Experience</p>
            <p className="font-medium">{job.experienceMin} - {job.experienceMax} Years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1"/> Salary</p>
            <p className="font-medium">{formatINR(job.salaryMin)} - {formatINR(job.salaryMax)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1 flex items-center"><Clock className="w-4 h-4 mr-1"/> Job Type</p>
            <p className="font-medium">{job.type} • {job.mode}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {job.description}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(skill => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4">Job Overview</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span className="text-gray-500">Posted:</span> <span className="font-medium">{new Date(job.createdAt).toLocaleDateString()}</span></li>
              <li className="flex justify-between"><span className="text-gray-500">Openings:</span> <span className="font-medium">{job.openings}</span></li>
              <li className="flex justify-between"><span className="text-gray-500">Status:</span> <span className="font-medium">{job.status}</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Auth Pages ---
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === UserRole.ADMIN) navigate('/admin/dashboard');
      else if (user.role === UserRole.EMPLOYER) navigate('/employer/dashboard');
      else navigate('/search');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastComponent />
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <Briefcase className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <Button type="submit" className="w-full" isLoading={loading}>Sign in</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Register here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', name: '', role: UserRole.SEEKER });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData, password);
      navigate(formData.role === UserRole.EMPLOYER ? '/employer/dashboard' : '/seeker/profile');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastComponent />
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <Input
            label="Email address"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          <Select
            label="I am a..."
            required
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
            options={[
              { value: UserRole.SEEKER, label: 'Job Seeker' },
              { value: UserRole.EMPLOYER, label: 'Employer / Recruiter' }
            ]}
          />
          <Button type="submit" className="w-full" isLoading={loading}>Register</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
