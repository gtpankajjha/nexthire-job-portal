import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, FileText, Bookmark, Upload, CheckCircle, Loader2, Building, MapPin } from 'lucide-react';
import { Button, Input, Card, Badge, JobCard, useToast, Select, ResumeViewerButton } from './ui-components';
import { DashboardLayout } from './layout';
import { useAuth } from './App';
import { applicationService, savedJobService, authService, storageService } from './services';
import { Application, Job, WorkMode } from './types';

const sidebarLinks = [
  { to: '/seeker/profile', icon: User, label: 'My Profile' },
  { to: '/seeker/applications', icon: FileText, label: 'Applications' },
  { to: '/seeker/saved', icon: Bookmark, label: 'Saved Jobs' },
];

export const SeekerProfile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    headline: user?.headline || '',
    currentJobTitle: user?.currentJobTitle || '',
    currentCompany: user?.currentCompany || '',
    totalExperience: user?.totalExperience || 0,
    skills: user?.skills?.join(', ') || '',
    noticePeriod: user?.noticePeriod || '',
    expectedSalary: user?.expectedSalary || 0,
    preferredLocations: user?.preferredLocations || '',
    preferredWorkMode: user?.preferredWorkMode || '',
    education: user?.education || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',
    portfolioUrl: user?.portfolioUrl || '',
    resumeUrl: user?.resumeUrl || '',
    resumeFileName: user?.resumeFileName || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const calculateCompletion = (currentData = formData) => {
    const fields = [
      currentData.name, currentData.phone, currentData.location, currentData.headline, 
      currentData.totalExperience !== undefined, currentData.skills, currentData.education, 
      currentData.resumeUrl
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Safely capture the input element reference before any async operations.
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    
    if (!file || !user) return;
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a PDF or Word document.', 'error');
      inputElement.value = ''; // Reset invalid file
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Storage and get Download URL
      const url = await storageService.uploadResume(user.id, file);
      
      // 2. Calculate new completion percentage
      const newFormData = { ...formData, resumeUrl: url, resumeFileName: file.name };
      const newPercentage = calculateCompletion(newFormData);
      const isCompleted = newPercentage >= 80;

      // 3. Save to Firestore immediately
      const updates = {
        resumeUrl: url,
        resumeFileName: file.name,
        profileCompleted: isCompleted,
        profileCompletionPercentage: newPercentage
      };
      await authService.updateUser(user.id, updates);

      // 4. Update local React state
      setFormData(newFormData);
      
      showToast('Resume uploaded and saved successfully');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload resume', 'error');
    } finally {
      setUploading(false);
      // Safely reset file input using the captured reference
      if (inputElement) {
        inputElement.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const updates = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        profileCompleted: completionPercentage >= 80,
        profileCompletionPercentage: completionPercentage
      };
      await authService.updateUser(user.id, updates);
      showToast('Profile updated successfully');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <ToastComponent />
      <div className="max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-1">Complete your profile to increase your chances of getting noticed by employers.</p>
          
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-bold text-primary-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label="Phone Number *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              <Input label="Current Location *" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required placeholder="City, State" />
            </div>
          </Card>

          {/* Professional Information */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Professional Headline *" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} required placeholder="e.g. Senior React Developer" />
              <Input label="Total Experience (Years) *" type="number" step="0.1" value={formData.totalExperience} onChange={e => setFormData({...formData, totalExperience: Number(e.target.value)})} required />
              <Input label="Current Job Title" value={formData.currentJobTitle} onChange={e => setFormData({...formData, currentJobTitle: e.target.value})} />
              <Input label="Current Company" value={formData.currentCompany} onChange={e => setFormData({...formData, currentCompany: e.target.value})} />
              <Input label="Expected Salary (INR)" type="number" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: Number(e.target.value)})} placeholder="e.g. 1200000" />
              <Input label="Notice Period" value={formData.noticePeriod} onChange={e => setFormData({...formData, noticePeriod: e.target.value})} placeholder="e.g. 30 Days" />
              <Select label="Preferred Work Mode" value={formData.preferredWorkMode} onChange={e => setFormData({...formData, preferredWorkMode: e.target.value})} options={Object.values(WorkMode).map(m => ({value: m, label: m}))} />
              <Input label="Preferred Locations" value={formData.preferredLocations} onChange={e => setFormData({...formData, preferredLocations: e.target.value})} placeholder="e.g. Bangalore, Remote" />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated) *</label>
              <textarea 
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2"
                rows={3}
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
                placeholder="React, TypeScript, Node.js..."
              />
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Education</h2>
            <div className="grid grid-cols-1 gap-6">
              <Input label="Highest Qualification *" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} required placeholder="e.g. B.Tech in Computer Science, XYZ University, 2020" />
            </div>
          </Card>

          {/* Online Profiles */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Online Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="LinkedIn URL" type="url" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
              <Input label="GitHub URL" type="url" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              <Input label="Portfolio URL" type="url" value={formData.portfolioUrl} onChange={e => setFormData({...formData, portfolioUrl: e.target.value})} />
            </div>
          </Card>

          {/* Resume */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Resume *</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {formData.resumeFileName ? (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">{formData.resumeFileName}</span>
                    {formData.resumeUrl && (
                      <ResumeViewerButton 
                        resumeUrl={formData.resumeUrl}
                        variant="ghost"
                        className="ml-4 text-sm text-primary-600 hover:text-primary-800 font-medium whitespace-nowrap p-0 h-auto"
                      >
                        View
                      </ResumeViewerButton>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-sm">
                    No resume uploaded yet.
                  </div>
                )}
              </div>
              <div>
                <input type="file" id="resume-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                <label htmlFor="resume-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {formData.resumeFileName ? 'Replace Resume' : 'Upload Resume'}
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX. Max size: 5MB.</p>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={loading}>Save Profile</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export const SeekerApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<(Application & { job?: Job })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      applicationService.getSeekerApplications(user.id).then(apps => {
        setApplications(apps);
        setLoading(false);
      });
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Shortlisted': return 'bg-purple-100 text-purple-800';
      case 'Interview': return 'bg-indigo-100 text-indigo-800';
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-1 mb-4">Start applying to jobs to see them here.</p>
            <Link to="/search"><Button>Browse Jobs</Button></Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {app.job?.title || 'Unknown Job'}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Building className="w-4 h-4 mr-1" /> {app.job?.company}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" /> {app.job?.location || 'Location not specified'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                  <Link to={`/jobs/${app.jobId}`}>
                    <Button variant="outline" size="sm">View Job</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const SeekerSavedJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      savedJobService.getSavedJobs(user.id).then(data => {
        setJobs(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleRemove = async (jobId: string) => {
    if (!user) return;
    await savedJobService.toggleSave(user.id, jobId);
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No saved jobs</h3>
            <p className="text-gray-500 mt-1 mb-4">Jobs you save will appear here.</p>
            <Link to="/search"><Button>Browse Jobs</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} isSaved={true} onSave={() => handleRemove(job.id)} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
