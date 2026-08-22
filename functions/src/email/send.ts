import type { EmailProvider } from './provider.js';
import { markEmailFailed, markEmailSent, reserveEmailEvent } from './event-store.js';
import type { EmailEventType, EmailPayload } from '../types.js';

export async function sendTrackedEmail(input: {
  eventKey: string;
  type: EmailEventType;
  template: string;
  recipient: string;
  payload: EmailPayload;
  provider: EmailProvider;
  userId?: string;
  applicationId?: string;
  secrets?: string[];
}): Promise<void> {
  const reserved = await reserveEmailEvent({
    eventKey: input.eventKey,
    type: input.type,
    recipient: input.recipient,
    template: input.template,
    userId: input.userId,
    applicationId: input.applicationId
  });
  if (!reserved) return;

  try {
    const sent = await input.provider.sendEmail(input.payload);
    await markEmailSent(input.eventKey, sent.id);
  } catch (error) {
    await markEmailFailed(input.eventKey, error, input.secrets);
    throw error;
  }
}

export async function recordEmailFailure(input: {
  eventKey: string;
  type: EmailEventType;
  template: string;
  recipient?: string;
  userId?: string;
  applicationId?: string;
  error: string;
}): Promise<void> {
  const reserved = await reserveEmailEvent({
    eventKey: input.eventKey,
    type: input.type,
    recipient: input.recipient || 'unknown',
    template: input.template,
    userId: input.userId,
    applicationId: input.applicationId
  });
  if (reserved) await markEmailFailed(input.eventKey, new Error(input.error));
}
