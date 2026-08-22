import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getJob, getUser } from '../data/firestore.js';
import { resendApiKey, resendFromEmail } from '../email/config.js';
import { recordEmailFailure, sendTrackedEmail } from '../email/send.js';
import { ResendProvider } from '../email/resend.provider.js';
import { applicationConfirmationEmail, employerNewApplicationEmail } from '../email/templates.js';
import type { NotificationApplication } from '../types.js';

export const applicationCreated = onDocumentCreated({
  document: 'applications/{applicationId}',
  region: 'asia-south1',
  secrets: [resendApiKey]
}, async event => {
  const applicationId = event.params.applicationId;
  const application = readApplication(applicationId, event.data?.data());
  if (!application) {
    console.error('Application notification skipped: required application fields are missing.', { applicationId });
    return;
  }

  const [candidate, employer, job] = await Promise.all([
    getUser(application.seekerId),
    getUser(application.employerId),
    getJob(application.jobId)
  ]);
  const provider = new ResendProvider(resendApiKey.value(), resendFromEmail.value());
  const candidateEventKey = `application-confirmation:${applicationId}`;
  const employerEventKey = `application-employer-notification:${applicationId}`;

  if (!candidate?.name || !candidate.email || !employer?.name || !employer.email || !job?.title || !job.company) {
    const missing = [
      !candidate?.name || !candidate.email ? 'candidate' : null,
      !employer?.name || !employer.email ? 'employer' : null,
      !job?.title || !job.company ? 'job' : null
    ].filter(Boolean).join(', ');
    console.error('Application notification skipped: required data is missing.', { applicationId, missing });
    await Promise.all([
      recordEmailFailure({
        eventKey: candidateEventKey,
        type: 'application-confirmation',
        template: 'application-confirmation',
        recipient: candidate?.email,
        applicationId,
        userId: application.seekerId,
        error: `Required ${missing} data is missing.`
      }),
      recordEmailFailure({
        eventKey: employerEventKey,
        type: 'application-employer-notification',
        template: 'application-employer-notification',
        recipient: employer?.email,
        applicationId,
        userId: application.employerId,
        error: `Required ${missing} data is missing.`
      })
    ]);
    return;
  }

  const templateData = { candidate, employer, job };
  const results = await Promise.allSettled([
    sendTrackedEmail({
      eventKey: candidateEventKey,
      type: 'application-confirmation',
      template: 'application-confirmation',
      recipient: candidate.email,
      payload: { to: candidate.email, ...applicationConfirmationEmail(templateData) },
      provider,
      userId: application.seekerId,
      applicationId,
      secrets: [resendApiKey.value()]
    }),
    sendTrackedEmail({
      eventKey: employerEventKey,
      type: 'application-employer-notification',
      template: 'application-employer-notification',
      recipient: employer.email,
      payload: { to: employer.email, ...employerNewApplicationEmail(templateData) },
      provider,
      userId: application.employerId,
      applicationId,
      secrets: [resendApiKey.value()]
    })
  ]);

  if (results.some(result => result.status === 'rejected')) {
    throw new Error('One or more application notification emails failed.');
  }
});

function readApplication(applicationId: string, data: FirebaseFirestore.DocumentData | undefined): NotificationApplication | null {
  if (!data || typeof data.jobId !== 'string' || typeof data.seekerId !== 'string' || typeof data.employerId !== 'string' || typeof data.status !== 'string') {
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
