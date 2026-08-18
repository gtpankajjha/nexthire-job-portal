import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, PlusCircle, Edit, Eye, MoreVertical, Building, MapPin, FileText, ExternalLink } from 'lucide-react';
import { Button, Input, Card, Badge, Select, useToast, Modal, formatINR, ResumeViewerButton } from './ui-components';
import { DashboardLayout } from './layout';
import { useAuth } from './App';
import { jobService, applicationService, companyService } from './services';
import { Job, Application, JobType, WorkMode, JobStatus, ApplicationStatus, User, Company } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sidebarLinks = [
  { to: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employer/jobs', icon: Briefcase, label: 'Manage Jobs' },
  { to: '/employer/post-job', icon: PlusCircle, label: 'Post a Job' },
  { to: '/employer/company', icon: Building, label: 'Company Profile' },
];

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ activeJobs: 0, totalApps: 0, newApps: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const jobs = await jobService.getJobs({ employerId: user.id, includeAllStatuses: true });
      const apps = await applicationService.getEmployerApplications(user.id);
      
      setStats({
        activeJobs: jobs.filter(j => j.status === JobStatus.ACTIVE).length,
        totalApps: apps.length,
        newApps: apps.filter(a => a.status === ApplicationStatus.APPLIED).length
      });

      const data = jobs.slice(0, 5).map(j => ({
        name: j.title.substring(0, 15) + '...',
        applications: apps.filter(a => a.jobId === j.id).length
      }));
      setChartData(data);
    };
    fetchData();
  }, [user]);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Employer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-primary-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Jobs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeJobs}</p>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApps}</p>
        </Card>
        <Card className="p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">New Applications</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.newApps}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Applications per Job</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export const EmployerCompanyProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '', description: '', website: '', location: '', industry: '', size: '', logo: ''
  });

  useEffect(() => {
    if (user) {
      companyService.getCompanyByEmployer(user.id).then(company => {
        if (company) setFormData(company);
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await companyService.saveCompany(user.id, formData);
      showToast('Company profile saved successfully');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <ToastComponent />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h1>
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Company Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input label="Industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Information Technology" />
              <Input label="Company Size" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="e.g. 50-200 employees" />
              <Input label="Headquarters Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              <Input label="Website URL" type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              <Input label="Logo URL" type="url" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <textarea 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="submit" isLoading={loading}>Save Company Profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export const ManageJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      jobService.getJobs({ employerId: user.id, includeAllStatuses: true }).then(data => {
        setJobs(data);
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
        <Link to="/employer/post-job"><Button size="sm"><PlusCircle className="w-4 h-4 mr-2"/> Post Job</Button></Link>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map(job => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500">{job.location} • {job.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={job.status === JobStatus.ACTIVE ? 'success' : job.status === JobStatus.DRAFT ? 'warning' : 'default'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/employer/jobs/${job.id}/applicants`} className="text-primary-600 hover:text-primary-900 mr-4">Applicants</Link>
                    <Link to={`/jobs/${job.id}`} className="text-gray-600 hover:text-gray-900">View</Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && !loading && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No jobs posted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    title: '', location: '', type: JobType.FULL_TIME, mode: WorkMode.OFFICE,
    salaryMin: 0, salaryMax: 0, experienceMin: 0, experienceMax: 0,
    description: '', skills: '', openings: 1
  });

  useEffect(() => {
    if (user) {
      companyService.getCompanyByEmployer(user.id).then(setCompany);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const companyName = company?.name || 'Company information not provided';
      const companyLogo = company?.logo || undefined;

      await jobService.createJob({
        ...formData,
        employerId: user.id,
        company: companyName,
        companyLogo: companyLogo,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        status: JobStatus.ACTIVE
      });
      showToast('Job posted successfully!');
      setTimeout(() => navigate('/employer/jobs'), 1500);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <ToastComponent />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>
        
        {!company && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <strong>Note:</strong> You haven't set up your Company Profile yet. Jobs will be posted as "Company information not provided". <Link to="/employer/company" className="underline font-medium">Set up company profile</Link>.
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="Job Title *" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
  <Input label="Location *" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
  <Select label="Job Type *" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as JobType})} options={Object.values(JobType).map(t => ({value: t, label: t}))} />
  <Select label="Work Mode *" required value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value as WorkMode})} options={Object.values(WorkMode).map(m => ({value: m, label: m}))} />
<Input label="Minimum Salary (INR) *" required value={formData.salaryMin} onChange={e => setFormData({...formData, salaryMin: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 500000" />
<Input label="Maximum Salary (INR) *" required value={formData.salaryMax} onChange={e => setFormData({...formData, salaryMax: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 1000000" />
<Input label="Min Experience (Years) *" required value={formData.experienceMin} onChange={e => setFormData({...formData, experienceMin: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 2" />
<Input label="Max Experience (Years) *" required value={formData.experienceMax} onChange={e => setFormData({...formData, experienceMax: e.target.value.replace(/\D/g, '')})} placeholder="e.g. 5" />
  <Input label="Number of Openings *" type="number" required value={formData.openings} onChange={e => setFormData({...formData, openings: Number(e.target.value)})} />
  <Input label="Required Skills (comma separated) *" required value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea 
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                rows={6}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => navigate('/employer/jobs')}>Cancel</Button>
              <Button type="submit" isLoading={loading}>Publish Job</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export const JobApplicants: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & { seeker?: User })[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (user && jobId) {
      jobService.getJobById(jobId).then(setJob);
      applicationService.getEmployerApplications(user.id, jobId).then(setApplications);
    }
  }, [user, jobId]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [appId]: true }));
    try {
      await applicationService.updateStatus(appId, newStatus);
      setApplications(apps => apps.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      showToast(`Status updated to ${newStatus}`);
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [appId]: false }));
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <ToastComponent />
      
      <Modal isOpen={!!selectedApplicant} onClose={() => setSelectedApplicant(null)} title="Candidate Profile">
        {selectedApplicant && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {selectedApplicant.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h2>
                <p className="text-gray-600">{selectedApplicant.headline}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block">Email</span><span className="font-medium">{selectedApplicant.email}</span></div>
              <div><span className="text-gray-500 block">Phone</span><span className="font-medium">{selectedApplicant.phone || 'N/A'}</span></div>
              <div><span className="text-gray-500 block">Location</span><span className="font-medium">{selectedApplicant.location || 'N/A'}</span></div>
              <div><span className="text-gray-500 block">Experience</span><span className="font-medium">{selectedApplicant.totalExperience} Years</span></div>
              <div><span className="text-gray-500 block">Current Company</span><span className="font-medium">{selectedApplicant.currentCompany || 'N/A'}</span></div>
              <div><span className="text-gray-500 block">Expected Salary</span><span className="font-medium">{selectedApplicant.expectedSalary ? formatINR(selectedApplicant.expectedSalary) : 'N/A'}</span></div>
            </div>

            <div>
              <span className="text-gray-500 block text-sm mb-1">Skills</span>
              <div className="flex flex-wrap gap-1">
                {selectedApplicant.skills?.map(s => <Badge key={s}>{s}</Badge>)}
              </div>
            </div>

            {selectedApplicant.resumeUrl && (
              <div className="pt-4 border-t">
                <ResumeViewerButton 
                  resumeUrl={selectedApplicant.resumeUrl}
                  variant="ghost"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium p-0 h-auto"
                >
                  <FileText className="w-4 h-4 mr-2" /> View Resume <ExternalLink className="w-3 h-3 ml-1" />
                </ResumeViewerButton>
              </div>
            )}
          </div>
        )}
      </Modal>

      <div className="mb-6">
        <Link to="/employer/jobs" className="text-sm text-primary-600 hover:underline mb-2 inline-block">&larr; Back to Jobs</Link>
        <h1 className="text-2xl font-bold text-gray-900">Applicants for: {job?.title}</h1>
      </div>

      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl flex-shrink-0">
                  {app.seeker?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary-600" onClick={() => app.seeker && setSelectedApplicant(app.seeker)}>
                    {app.seeker?.name}
                  </h3>
                  <p className="text-sm text-gray-600">{app.seeker?.headline || 'No headline provided'}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1"/> {app.seeker?.totalExperience || 0} yrs</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {app.seeker?.location || 'N/A'}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {app.seeker?.skills?.slice(0, 5).map(s => <Badge key={s} variant="info">{s}</Badge>)}
                    {(app.seeker?.skills?.length || 0) > 5 && <Badge variant="info">+{app.seeker!.skills!.length - 5}</Badge>}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <Select 
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                  options={Object.values(ApplicationStatus).map(s => ({value: s, label: s}))}
                  className="w-40 text-sm"
                  disabled={updatingStatus[app.id]}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => app.seeker && setSelectedApplicant(app.seeker)}>View Profile</Button>
                  {app.seeker?.resumeUrl && (
                    <ResumeViewerButton 
                      resumeUrl={app.seeker.resumeUrl}
                      variant="secondary" 
                      size="sm"
                    >
                      <FileText className="w-4 h-4 mr-1"/> Resume
                    </ResumeViewerButton>
                  )}
                </div>
                <span className="text-xs text-gray-400">Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card className="p-8 text-center text-gray-500">No applications received yet.</Card>
        )}
      </div>
    </DashboardLayout>
  );
};
