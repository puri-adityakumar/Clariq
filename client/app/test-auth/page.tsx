"use client";

import { useState } from 'react';
import { useAuth } from '../../appwrite/AuthProvider';
import { apiClient } from '../../lib/api';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export default function TestAuthPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
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
    <div className="container mx-auto px-6 py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Suite</h1>
      
      {/* Current Auth Status */}
      <div className="bg-white/5 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Authentication Status</h2>
        <div className="space-y-2">
          <p><strong>Frontend User:</strong> {user ? user.email : 'Not logged in'}</p>
          <p><strong>User ID:</strong> {user?.$id || 'N/A'}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              user ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {user ? 'Authenticated' : 'Not authenticated'}
            </span>
          </p>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => runTest('backendConnection', apiClient.testConnection)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 px-4 py-2 rounded font-medium transition-colors"
        >
          Test Backend Connection
        </button>

        <button
          onClick={() => runTest('apiKeyAuth', apiClient.testWithApiKey)}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 px-4 py-2 rounded font-medium transition-colors"
        >
          Test API Key Auth
        </button>

        <button
          onClick={() => runTest('userAuth', apiClient.getCurrentUser)}
          disabled={loading || !user}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-900 px-4 py-2 rounded font-medium transition-colors"
        >
          Test User Session Auth
        </button>

        <button
          disabled
          className="bg-gray-600 px-4 py-2 rounded font-medium cursor-not-allowed"
        >
          Research Job (Coming Soon)
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
        <h3 className="font-semibold mb-2 text-yellow-300">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-200">
          <li>First test "Backend Connection" (should work for everyone)</li>
          <li>Test "API Key Auth" (uses static dev key)</li>
          <li>Sign in first at <a href="/signin" className="underline">/signin</a> if not already</li>
          <li>Then test "User Session Auth" (validates your Appwrite session)</li>
        </ol>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Results</h2>
        {Object.entries(results).map(([testName, result]) => (
          <div key={testName} className="bg-white/5 rounded-lg p-4">
            <h3 className="font-semibold mb-2 capitalize flex items-center">
              {testName.replace(/([A-Z])/g, ' $1')}
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {result.success ? 'PASS' : 'FAIL'}
              </span>
            </h3>
            <div className={`p-3 rounded text-sm ${
              result.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {result.success ? (
                <pre className="whitespace-pre-wrap overflow-auto text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
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