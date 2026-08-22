import { Resend } from 'resend';
import type { EmailPayload, SentEmail } from '../types.js';
import type { EmailProvider } from './provider.js';

export class ResendProvider implements EmailProvider {
  private readonly client: Resend;

  constructor(private readonly apiKey: string, private readonly from: string) {
    this.client = new Resend(apiKey);
  }

  async sendEmail(payload: EmailPayload): Promise<SentEmail> {
    const response = await this.client.emails.send({
      from: this.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html
    });

    if (response.error) {
      throw new Error(response.error.message || 'Resend rejected the email request.');
    }

    return { id: response.data?.id };
  }
}
