import { ApplicationStatus } from './enums';
import type { Job } from './job';
import type { User } from './user';

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

export type SeekerApplication = Application & { job?: Job };
export type EmployerApplication = Application & { seeker?: User; job?: Job };