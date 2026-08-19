import { JobStatus, JobType, WorkMode } from './enums';

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