export enum UserRole {
  SEEKER = 'SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum JobType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  FREELANCE = 'Freelance'
}

export enum WorkMode {
  OFFICE = 'Work from office',
  HYBRID = 'Hybrid',
  REMOTE = 'Remote'
}

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  CLOSED = 'CLOSED'
}

export enum ApplicationStatus {
  APPLIED = 'Applied',
  SHORTLISTED = 'Shortlisted',
  INTERVIEW = 'Interview',
  SELECTED = 'Selected',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: number;
  profilePhoto?: string;
  
  // Seeker specific profile fields
  phone?: string;
  location?: string;
  headline?: string;
  totalExperience?: number;
  currentCompany?: string;
  currentJobTitle?: string;
  skills?: string[];
  education?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  noticePeriod?: string;
  expectedSalary?: number;
  preferredLocations?: string;
  preferredWorkMode?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  profileCompleted?: boolean;
  profileCompletionPercentage?: number;
}

export interface Company {
  id: string;
  employerId: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  createdAt: number;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: JobType;
  mode: WorkMode;
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  description: string;
  skills: string[];
  status: JobStatus;
  createdAt: number;
  openings: number;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  employerId: string;
  status: ApplicationStatus;
  appliedAt: number;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface SavedJob {
  id: string;
  seekerId: string;
  jobId: string;
  savedAt: number;
}
