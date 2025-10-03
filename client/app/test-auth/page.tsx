"use client";

import { useState } from 'react';
import { useAuth } from '../../appwrite/AuthProvider';
import { apiClient } from '../../lib/api';
import { Button } from '../../components/ui/button';
import Badge from '../../components/ui/badge';

interface ApiEnvelope<T = unknown> { data?: T; message?: string; }
interface UserAuthData {
  email: string;
  name?: string;
  user_id: string;
  email_verification: boolean;
  created_at: string;
  labels?: string[];
}
interface TestResult { success: boolean; data?: ApiEnvelope<UserAuthData> | ApiEnvelope | unknown; error?: string; }

export default function TestAuthPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result as ApiEnvelope } }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
    setLoading(false);
  };

  return (
    <div className="container py-24 max-w-5xl">
      <h1 className="heading-3 font-heading mb-10 tracking-tight">Authentication Test Suite</h1>

      <div className="card mb-10">
        <h2 className="heading-5 mb-4">Current Authentication Status</h2>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div>
            <p className="text-white/70 mb-1">Frontend User</p>
            <p className="font-medium">{user ? user.email : 'Not logged in'}</p>
          </div>
          <div>
            <p className="text-white/70 mb-1">User ID</p>
            <p className="font-mono text-xs break-all">{user?.$id || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white/70">Status</p>
            <Badge variant={user ? 'success' : 'destructive'} size="sm">{user ? 'Authenticated' : 'Not Authenticated'}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white/70">Email Verification</p>
            <Badge variant={user?.emailVerification ? 'success' : 'warning'} size="sm">{user?.emailVerification ? 'Verified' : 'Pending'}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Button onClick={() => runTest('backendConnection', () => apiClient.testConnection())} disabled={loading} className="w-full">Test Backend Connection</Button>
        <Button onClick={() => runTest('userAuth', () => apiClient.getCurrentUser())} disabled={loading || !user} variant="secondary" className="w-full">Test User Session Auth</Button>
      </div>

      <div className="card border-yellow-400/15 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent mb-10">
        <h3 className="font-medium text-yellow-300 mb-3 tracking-wide text-xs uppercase">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-xs text-yellow-200/90">
          <li>Run Backend Connection (public health endpoint)</li>
          <li>Sign in at <a href="/signin" className="underline">/signin</a> if not already</li>
          <li>Run User Session Auth to validate JWT + fetch profile</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h2 className="heading-5">Test Results</h2>
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="card p-5">
            <h3 className="font-medium mb-3 capitalize flex items-center gap-2 text-sm">
              {testName.replace(/([A-Z])/g, ' $1')}
              <Badge variant={result.success ? 'success' : 'destructive'} size="sm">{result.success ? 'Pass' : 'Fail'}</Badge>
            </h3>
            <div className={`p-4 rounded-md text-xs leading-relaxed border ${result.success ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
              {result.success ? (
                testName === 'userAuth' && (result.data as ApiEnvelope<UserAuthData>)?.data ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/15 text-green-300 p-3 rounded-md mb-1">
                      <p className="text-sm font-semibold">Authentication Successful</p>
                    </div>
                    <div className="space-y-1.5 text-white/90">
                      <p><span className="text-white/50">Email:</span> <span className="font-medium text-blue-300">{(result.data as ApiEnvelope<UserAuthData>).data!.email}</span></p>
                      <p><span className="text-white/50">Name:</span> {(result.data as ApiEnvelope<UserAuthData>).data!.name || 'Not set'}</p>
                      <p className="flex flex-wrap gap-1"><span className="text-white/50">User ID:</span> <span className="font-mono text-[10px] break-all">{(result.data as ApiEnvelope<UserAuthData>).data!.user_id}</span></p>
                      <p className="flex items-center gap-2"><span className="text-white/50">Email Verified:</span> <Badge variant={(result.data as ApiEnvelope<UserAuthData>).data!.email_verification ? 'success' : 'warning'} size="sm">{(result.data as ApiEnvelope<UserAuthData>).data!.email_verification ? 'Yes' : 'No'}</Badge></p>
                      <p><span className="text-white/50">Joined:</span> {new Date((result.data as ApiEnvelope<UserAuthData>).data!.created_at).toLocaleDateString()}</p>
                      {(result.data as ApiEnvelope<UserAuthData>).data!.labels && (result.data as ApiEnvelope<UserAuthData>).data!.labels!.length > 0 && (
                        <p><span className="text-white/50">Labels:</span> {(result.data as ApiEnvelope<UserAuthData>).data!.labels!.join(', ')}</p>
                      )}
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-white/50 hover:text-white/70">View Raw Response</summary>
                      <pre className="whitespace-pre-wrap overflow-auto text-[10px] mt-2 bg-black/30 p-3 rounded-md text-white/60">{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap overflow-auto text-xs text-gray-300">{JSON.stringify(result.data, null, 2)}</pre>
                )
              ) : (
                <p>Error: {result.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}