import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../firebase.js';
import type { EmailEvent, EmailEventType } from '../types.js';

export async function reserveEmailEvent(input: {
  eventKey: string;
  type: EmailEventType;
  recipient: string;
  template: string;
  userId?: string;
  applicationId?: string;
}): Promise<boolean> {
  const eventRef = db.doc(`emailEvents/${input.eventKey}`);

  return db.runTransaction(async transaction => {
    const existing = (await transaction.get(eventRef)).data() as EmailEvent | undefined;
    if (existing?.status === 'sent' || existing?.status === 'pending') return false;

    transaction.set(eventRef, {
      ...input,
      status: 'pending',
      attempts: (existing?.attempts || 0) + 1,
      createdAt: existing?.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return true;
  });
}

export async function markEmailSent(eventKey: string, providerMessageId?: string): Promise<void> {
  await db.doc(`emailEvents/${eventKey}`).set({
    status: 'sent',
    ...(providerMessageId ? { providerMessageId } : {}),
    updatedAt: FieldValue.serverTimestamp(),
    sentAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

export async function markEmailFailed(eventKey: string, error: unknown, secrets: string[] = []): Promise<void> {
  await db.doc(`emailEvents/${eventKey}`).set({
    status: 'failed',
    lastError: safeErrorMessage(error, secrets),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

function safeErrorMessage(error: unknown, secrets: string[]): string {
  const message = error instanceof Error ? error.message : 'Email delivery failed.';
  return secrets.reduce((safeMessage, secret) => {
    return secret ? safeMessage.split(secret).join('[redacted]') : safeMessage;
  }, message).replace(/(re|api[_-]?key|authorization|bearer)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]').slice(0, 500);
}
