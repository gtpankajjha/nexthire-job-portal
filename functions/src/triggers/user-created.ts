import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getUser } from '../data/firestore.js';
import { reserveEmailEvent, markEmailFailed, markEmailSent } from '../email/event-store.js';
import { ResendProvider } from '../email/resend.provider.js';
import { welcomeEmail } from '../email/templates.js';
import { resendApiKey, resendFromEmail } from '../email/config.js';

export const userCreated = onDocumentCreated({
  document: 'users/{userId}',
  region: 'asia-south1',
  secrets: [resendApiKey]
}, async event => {
  const userId = event.params.userId;
  const user = await getUser(userId);
  if (!user?.email) return;

  const eventKey = `welcome:${userId}`;
  const reserved = await reserveEmailEvent({
    eventKey,
    type: 'welcome',
    recipient: user.email,
    template: 'welcome',
    userId
  });
  if (!reserved) return;

  try {
    const provider = new ResendProvider(resendApiKey.value(), resendFromEmail.value());
    const template = welcomeEmail(user);
    const sent = await provider.sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
    await markEmailSent(eventKey, sent.id);
  } catch (error) {
    await markEmailFailed(eventKey, error, [resendApiKey.value()]);
    throw error;
  }
});
