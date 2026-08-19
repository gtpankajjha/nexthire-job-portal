import { UserRole } from './enums';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: number;
  profilePhoto?: string;
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