import { ID, Models } from 'appwrite';
import { account } from './config';

export interface EmailTokenResult {
  userId: string;
  expire: string;
  phrase?: string;
}

export async function sendEmailOtp(email: string, withPhrase: boolean): Promise<EmailTokenResult> {
  // Using documented object param shape; fall back to positional if types mismatch
  let res: unknown;
  interface EmailTokenAPI {
    createEmailToken(params: { userId: string; email: string; phrase?: boolean }): Promise<unknown>;
    createEmailToken(userId: string, email: string): Promise<unknown>;
  }
  try {
    res = await (account as unknown as EmailTokenAPI).createEmailToken({ userId: ID.unique(), email, ...(withPhrase ? { phrase: true } : {}) });
  } catch {
    // fallback positional (userId, email)
    res = await (account as unknown as EmailTokenAPI).createEmailToken(ID.unique(), email);
  }
  const token = res as { userId: string; expire: string; phrase?: string };
  return { userId: token.userId, expire: token.expire, phrase: token.phrase };
}

export async function createEmailSession(userId: string, secret: string): Promise<Models.Session> {
  interface SessionAPI {
    createSession(params: { userId: string; secret: string }): Promise<Models.Session>;
    createSession(userId: string, secret: string): Promise<Models.Session>;
  }
  try {
    return await (account as unknown as SessionAPI).createSession({ userId, secret });
  } catch {
    return await (account as unknown as SessionAPI).createSession(userId, secret);
  }
}
