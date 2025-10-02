"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../appwrite/AuthProvider';
import { sendEmailOtp, createEmailSession } from '../../../appwrite/auth';

export default function SignInPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [phrase, setPhrase] = useState<string | undefined>('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<Record<string, unknown> | null>(null);
  const [usePhrase, setUsePhrase] = useState(true);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await sendEmailOtp(email, usePhrase);
      setUserId(res.userId);
      setPhrase(res.phrase);
      setStep('verify');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send code';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const session = await createEmailSession(userId, secret);
      setSessionInfo(session as unknown as Record<string, unknown>);
      await refresh();
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify code';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8">
        <h1 className="heading-3 font-heading text-center">Email OTP Login</h1>
        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-5">
            <p className="text-center text-muted font-body text-sm">Enter your email and we&apos;ll send you a 6-digit code.</p>
            <div className="space-y-2">
              <label className="block text-xs tracking-wide uppercase font-medium text-muted">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="w-full px-4 py-2.5 rounded-md bg-white/5 border border-white/15 focus:border-white/40 outline-none transition-colors text-sm" placeholder="you@example.com" />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={usePhrase} onChange={e=>setUsePhrase(e.target.checked)} className="accent-current" />
              Enable security phrase
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button disabled={loading} type="submit" className="btn btn-primary btn-lg w-full disabled:opacity-50">{loading? 'Sending...' : 'Send Code'}</button>
          </form>
        )}
        {step === 'verify' && !sessionInfo && (
          <form onSubmit={handleVerify} className="space-y-5">
            <p className="text-center text-muted font-body text-sm">We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it below to finish signing in.</p>
            {phrase && (
              <div className="p-3 rounded-md bg-white/5 border border-white/15 text-xs leading-relaxed">
                <p className="uppercase tracking-wide text-muted font-medium mb-1">Security Phrase</p>
                <p className="font-mono text-sm">{phrase}</p>
                <p className="mt-1 text-[10px] text-muted">Make sure this phrase matches the email to avoid phishing.</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-xs tracking-wide uppercase font-medium text-muted">6-Digit Code</label>
              <input value={secret} onChange={e=>setSecret(e.target.value)} inputMode="numeric" pattern="[0-9]*" maxLength={6} required className="tracking-widest text-center font-mono text-lg w-full px-4 py-2.5 rounded-md bg-white/5 border border-white/15 focus:border-white/40 outline-none transition-colors" placeholder="••••••" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button onClick={()=>{setStep('request'); setSecret('');}} type="button" className="btn btn-ghost flex-1">Back</button>
              <button disabled={loading || secret.length!==6} type="submit" className="btn btn-primary btn-lg flex-1 disabled:opacity-50">{loading? 'Verifying...' : 'Verify & Sign In'}</button>
            </div>
          </form>
        )}
        {sessionInfo && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-green-400">Logged in successfully. Redirecting...</p>
          </div>
        )}
      </div>
    </main>
  );
}
