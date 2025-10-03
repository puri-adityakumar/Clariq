/**
 * Test Runner Component for Phase 3.5 Integration Testing
 * 
 * This component provides a UI for running integration tests
 * and validating the Appwrite integration manually.
 */

"use client";
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../appwrite/AuthProvider';
import { useToast } from '../../lib/useToast';
import { 
  createResearchJob, 
  getResearchJobs, 
  getResearchJob,
  CreateResearchRequest 
} from '../../lib/appwrite/research';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export function IntegrationTestRunner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showTests, setShowTests] = useState(false);

  const tests = [
    {
      name: 'Database Connection',
      test: async (): Promise<{ success: boolean; message: string }> => {
        if (!user) {
          return { success: false, message: 'User not authenticated' };
        }
        
        try {
          await getResearchJobs(user.$id);
          return { success: true, message: 'Successfully connected to database' };
        } catch (error) {
          return { 
            success: false, 
            message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      }
    },
    {
      name: 'Job Creation',
      test: async (): Promise<{ success: boolean; message: string }> => {
        if (!user) {
          return { success: false, message: 'User not authenticated' };
        }

        const testData: CreateResearchRequest = {
          target: `Test Company ${Date.now()}`,
          enabledAgents: ['company_discovery'],
          additionalContext: 'Integration test job - safe to delete',
          userId: user.$id
        };

        try {
          const job = await createResearchJob(testData);
          return { 
            success: true, 
            message: `Job created successfully with ID: ${job.$id}` 
          };
        } catch (error) {
          return { 
            success: false, 
            message: `Job creation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      }
    },
    {
      name: 'Job Listing',
      test: async (): Promise<{ success: boolean; message: string }> => {
        if (!user) {
          return { success: false, message: 'User not authenticated' };
        }

        try {
          const jobs = await getResearchJobs(user.$id);
          return { 
            success: true, 
            message: `Retrieved ${jobs.length} jobs successfully` 
          };
        } catch (error) {
          return { 
            success: false, 
            message: `Job listing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      }
    },
    {
      name: 'Job Retrieval',
      test: async (): Promise<{ success: boolean; message: string }> => {
        if (!user) {
          return { success: false, message: 'User not authenticated' };
        }

        try {
          // First get a job to test with
          const jobs = await getResearchJobs(user.$id);
          if (jobs.length === 0) {
            return { 
              success: false, 
              message: 'No jobs available to test retrieval' 
            };
          }

          const job = await getResearchJob(jobs[0].$id);
          return { 
            success: true, 
            message: `Retrieved job '${job.target}' successfully` 
          };
        } catch (error) {
          return { 
            success: false, 
            message: `Job retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      }
    }
  ];

  const runAllTests = async () => {
    if (!user) {
      toast.error('Please authenticate first');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = tests.map(test => ({
      test: test.name,
      status: 'pending',
      message: 'Waiting to run...'
    }));

    setTestResults([...results]);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const startTime = Date.now();

      // Update status to running
      results[i] = {
        ...results[i],
        status: 'running',
        message: 'Running...'
      };
      setTestResults([...results]);

      try {
        const result = await test.test();
        const duration = Date.now() - startTime;

        results[i] = {
          ...results[i],
          status: result.success ? 'passed' : 'failed',
          message: result.message,
          duration
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        results[i] = {
          ...results[i],
          status: 'failed',
          message: `Test threw an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration
        };
      }

      setTestResults([...results]);
    }

    setIsRunning(false);

    const passed = results.filter(r => r.status === 'passed').length;
    const total = results.length;

    if (passed === total) {
      toast.success(`All ${total} tests passed! ✅`);
    } else {
      toast.error(`${total - passed} of ${total} tests failed ❌`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-white/60';
      case 'running':
        return 'text-blue-400';
      case 'passed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-white/60';
    }
  };

  if (!user) {
    return null; // Don't show test runner if not authenticated
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Integration Tests</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowTests(!showTests)}
          >
            {showTests ? 'Hide Tests' : 'Show Tests'}
          </Button>
          <Button
            size="sm"
            onClick={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      {showTests && (
        <div className="space-y-3">
          <div className="text-xs text-white/60">
            Tests validate Appwrite integration and basic functionality
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {getStatusIcon(result.status)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {result.test}
                      </div>
                      <div className={`text-xs ${getStatusColor(result.status)}`}>
                        {result.message}
                      </div>
                    </div>
                  </div>
                  
                  {result.duration && (
                    <div className="text-xs text-white/40">
                      {result.duration}ms
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-2 border-t border-white/10">
                <div className="text-xs text-white/60">
                  Passed: {testResults.filter(r => r.status === 'passed').length} / {testResults.length}
                </div>
              </div>
            </div>
          )}

          {testResults.length === 0 && (
            <div className="text-xs text-white/40 text-center py-4">
              Click &ldquo;Run Tests&rdquo; to start integration testing
            </div>
          )}
        </div>
      )}
    </div>
  );
}