import type { NotificationJob, NotificationStatus, NotificationUser } from '../types.js';

interface ApplicationTemplateData {
  candidate: NotificationUser;
  employer?: NotificationUser;
  job: NotificationJob;
}

interface EmailTemplate {
  subject: string;
  html: string;
}

export function welcomeEmail(user: NotificationUser): EmailTemplate {
  const safeName = escapeHtml(user.name);
  const safeRole = escapeHtml(user.role.toLowerCase());

  return {
    subject: 'Welcome to NextHire',
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;padding:32px;background:#ffffff;border:1px solid #e5eaf2;border-radius:8px;">
      <div style="font-size:24px;font-weight:700;color:#2563eb;">NextHire</div>
      <h1 style="margin:28px 0 12px;font-size:26px;">Welcome, ${safeName}</h1>
      <p style="font-size:16px;line-height:1.6;">Your ${safeRole} account is ready. We are glad to have you with us.</p>
      <p style="font-size:16px;line-height:1.6;">Sign in to complete your profile and start using NextHire.</p>
      <p style="margin-top:32px;color:#64748b;font-size:14px;">The NextHire team</p>
    </div>
  </body>
</html>`
  };
}

export function applicationConfirmationEmail(data: ApplicationTemplateData): EmailTemplate {
  const candidateName = escapeHtml(data.candidate.name);
  const jobTitle = escapeHtml(data.job.title);
  const company = escapeHtml(data.job.company);

  return {
    subject: `Application Received - ${data.job.title} at ${data.job.company}`,
    html: createLayout(`
      <h1>Application received</h1>
      <p>Hello ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> was successfully submitted.</p>
      <p>Current application status: <strong>Applied</strong>.</p>
      <p>We will keep you informed as your application progresses.</p>
    `)
  };
}

export function employerNewApplicationEmail(data: ApplicationTemplateData): EmailTemplate {
  const employerName = escapeHtml(data.employer?.name || 'there');
  const candidateName = escapeHtml(data.candidate.name);
  const jobTitle = escapeHtml(data.job.title);
  const company = escapeHtml(data.job.company);

  return {
    subject: `New Application - ${data.candidate.name} applied for ${data.job.title}`,
    html: createLayout(`
      <h1>New application received</h1>
      <p>Hello ${employerName},</p>
      <p><strong>${candidateName}</strong> has applied for <strong>${jobTitle}</strong> at <strong>${company}</strong>.</p>
      <p>Sign in to NextHire to review the application.</p>
    `)
  };
}

export function applicationStatusEmail(data: ApplicationTemplateData, status: NotificationStatus): EmailTemplate {
  const candidateName = escapeHtml(data.candidate.name);
  const jobTitle = escapeHtml(data.job.title);
  const company = escapeHtml(data.job.company);
  const messages: Record<NotificationStatus, string> = {
    Applied: 'Your application has been moved to the Applied stage.',
    Shortlisted: 'Your application has been shortlisted for further consideration.',
    Interview: 'Your application has moved to the interview stage. NextHire will provide further details when available.',
    Selected: 'You have been selected for the position. The employer will provide further details directly.',
    Rejected: 'The employer has decided not to move forward with your application at this time. We appreciate your interest and wish you success in your search.'
  };

  return {
    subject: `Application Update - ${data.job.title} at ${data.job.company}`,
    html: createLayout(`
      <h1>Application update</h1>
      <p>Hello ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${company}</strong> has been updated.</p>
      <p>${messages[status]}</p>
    `)
  };
}

function createLayout(content: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:32px auto;padding:32px;background:#ffffff;border:1px solid #e5eaf2;border-radius:8px;">
      <div style="font-size:24px;font-weight:700;color:#2563eb;">NextHire</div>
      <div style="font-size:16px;line-height:1.6;">${content}</div>
      <p style="margin-top:32px;color:#64748b;font-size:14px;">The NextHire team</p>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character] || character);
}
