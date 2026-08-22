import { defineSecret, defineString } from 'firebase-functions/params';

export const resendApiKey = defineSecret('RESEND_API_KEY');
export const resendFromEmail = defineString('RESEND_FROM_EMAIL');
