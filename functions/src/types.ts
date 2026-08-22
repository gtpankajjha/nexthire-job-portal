export type EmailEventStatus = 'pending' | 'sent' | 'failed';

export type EmailEventType =
  | 'welcome'
  | 'application-confirmation'
  | 'application-employer-notification'
  | 'application-status';

export interface EmailEvent {
  eventKey: string;
  type: EmailEventType;
  recipient: string;
  template: string;
  userId?: string;
  applicationId?: string;
  status: EmailEventStatus;
  attempts: number;
  providerMessageId?: string;
  lastError?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  sentAt?: unknown;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface NotificationUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface NotificationJob {
  id: string;
  title: string;
  company: string;
}

export interface NotificationApplication {
  id: string;
  jobId: string;
  seekerId: string;
  employerId: string;
  status: string;
}

export type NotificationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';

export interface SentEmail {
  id?: string;
}
