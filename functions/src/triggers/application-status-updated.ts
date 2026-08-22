import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getJob, getUser } from '../data/firestore.js';
import { resendApiKey, resendFromEmail } from '../email/config.js';
import { recordEmailFailure, sendTrackedEmail } from '../email/send.js';
import { ResendProvider } from '../email/resend.provider.js';
import { applicationStatusEmail } from '../email/templates.js';
import type { NotificationApplication, NotificationStatus } from '../types.js';

const statuses: NotificationStatus[] = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export const applicationStatusUpdated = onDocumentUpdated({
  document: 'applications/{applicationId}',
  region: 'asia-south1',
  secrets: [resendApiKey]
}, async event => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after || before.status === after.status) return;

  const applicationId = event.params.applicationId;
  const application = readApplication(applicationId, after);
  const status = after.status as NotificationStatus;
  const eventKey = `application-status:${applicationId}:${String(after.status)}`;

  if (!application || !statuses.includes(status)) {
    console.error('Application status notification skipped: invalid application or status.', { applicationId, status: after.status });
    await recordEmailFailure({
      eventKey,
      type: 'application-status',
      template: 'application-status',
      applicationId,
      error: 'Required application data or status is invalid.'
    });
    return;
  }

  const [candidate, job] = await Promise.all([
    getUser(application.seekerId),
    getJob(application.jobId)
  ]);
  if (!candidate?.name || !candidate.email || !job?.title || !job.company) {
    console.error('Application status notification skipped: required data is missing.', { applicationId });
    await recordEmailFailure({
      eventKey,
      type: 'application-status',
      template: `application-status-${status.toLowerCase()}`,
      recipient: candidate?.email,
      applicationId,
      userId: application.seekerId,
      error: 'Required candidate or job data is missing.'
    });
    return;
  }

  const provider = new ResendProvider(resendApiKey.value(), resendFromEmail.value());
  await sendTrackedEmail({
    eventKey,
    type: 'application-status',
    template: `application-status-${status.toLowerCase()}`,
    recipient: candidate.email,
    payload: { to: candidate.email, ...applicationStatusEmail({ candidate, job }, status) },
    provider,
    userId: application.seekerId,
    applicationId,
    secrets: [resendApiKey.value()]
  });
});

function readApplication(applicationId: string, data: FirebaseFirestore.DocumentData): NotificationApplication | null {
  if (typeof data.jobId !== 'string' || typeof data.seekerId !== 'string' || typeof data.employerId !== 'string' || typeof data.status !== 'string') {
    return null;
  }

  return {
    id: applicationId,
    jobId: data.jobId,
    seekerId: data.seekerId,
    employerId: data.employerId,
    status: data.status
  };
}
