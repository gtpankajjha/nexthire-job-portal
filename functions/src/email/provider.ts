import type { EmailPayload, SentEmail } from '../types.js';

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<SentEmail>;
}
