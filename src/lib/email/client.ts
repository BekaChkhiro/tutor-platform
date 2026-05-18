import { Resend } from 'resend';

let _client: Resend | undefined;

export function getResend(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('RESEND_API_KEY is not set. Configure it in .env.local to send emails.');
    }
    _client = new Resend(key);
  }
  return _client;
}
