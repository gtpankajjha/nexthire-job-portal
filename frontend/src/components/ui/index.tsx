import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Job } from '../../types/job';

export const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const openInNewTab = (url: string | undefined) => {
  if (!url) return;
  try {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) alert("Pop-up blocked! Please allow pop-ups for this site to view the document.");
  } catch (error) {
    console.error("Error opening document:", error);
    alert("Unable to open document. It may be blocked by your browser settings.");
  }
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500"
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const ResumeViewerButton: React.FC<{ resumeUrl: string; className?: string; variant?: any; size?: any; children?: React.ReactNode }> = ({ resumeUrl, className, variant = 'primary', size = 'md', children }) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500"
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  return <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className || ''}`}>
    {children || 'View'}
  </a>;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 bg-white ${className}`} {...props}>
      <option value="">Select...</option>
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>{children}</div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'default' }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

let toastTimeout: any;
export const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => setToast(null), 3000);
  };

  const ToastComponent = () => {
    if (!toast) return null;
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
        <div className={`rounded-md p-4 shadow-lg flex items-center ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      </div>
    );
  };

  return { showToast, ToastComponent };
};

export const JobCard: React.FC<{ job: Job; onSave?: () => void; isSaved?: boolean }> = ({ job, onSave, isSaved }) => (
  <Card className="p-6 hover:shadow-md transition-shadow border border-gray-100">
    <div className="flex justify-between items-start">
      <div className="flex gap-4">
        {job.companyLogo ? <img src={job.companyLogo} alt={job.company} className="w-12 h-12 rounded object-cover border" /> : <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center"><Building className="w-6 h-6 text-gray-400" /></div>}
        <div>
          <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">{job.title}</Link>
          <p className="text-sm text-gray-600 mt-1">{job.company}</p>
        </div>
      </div>
      {onSave && <button onClick={onSave} className="text-gray-400 hover:text-primary-600 focus:outline-none"><svg className={`w-6 h-6 ${isSaved ? 'fill-primary-600 text-primary-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg></button>}
    </div>
    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
      <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location}</div>
      <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> {job.experienceMin}-{job.experienceMax} Yrs</div>
      <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> {formatINR(job.salaryMin)} - {formatINR(job.salaryMax)}</div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {job.skills.slice(0, 4).map(skill => <Badge key={skill}>{skill}</Badge>)}
      {job.skills.length > 4 && <Badge>+{job.skills.length - 4}</Badge>}
    </div>
    <div className="mt-5 flex items-center justify-between border-t pt-4">
      <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(job.createdAt).toLocaleDateString()}</span>
      <Link to={`/jobs/${job.id}`}><Button variant="outline" size="sm">View Details</Button></Link>
    </div>
  </Card>
);
