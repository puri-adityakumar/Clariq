// Enhanced Appwrite Research System - Phase 2 Implementation
// This file exports all the enhanced components and services for the research system

// Enhanced Appwrite Services
export { 
  ResearchService, 
  researchService,
  createResearchJob,
  getResearchJobs,
  getResearchJob,
  updateResearchJob,
  deleteResearchJob,
  retryResearchJob
} from './appwrite/research-enhanced';

// Enhanced React Hooks
export {
  useResearchJobs,
  useResearchJob,
  useAutoRefreshJobs,
  useResearchAnalytics
} from './appwrite/useResearch-enhanced';

// Enhanced UI Components
export { StatusBadge } from '../components/research/StatusBadgeEnhanced';
export { ResearchAnalyticsDashboard } from '../components/research/ResearchAnalyticsDashboard';

// Type definitions from research-enhanced
export type {
  ResearchJob,
  CreateResearchRequest,
  UpdateResearchRequest,
  ResearchJobFilters,
  ResearchJobStats
} from './appwrite/research-enhanced';

// Type definitions from hooks
export type {
  UseResearchJobsState,
  UseResearchJobsActions,
  UseResearchJobsResult,
  UseResearchJobResult
} from './appwrite/useResearch-enhanced';

export type { ResearchStatus } from '../components/research/StatusBadge';

// Constants and utilities
export const RESEARCH_AGENT_TYPES = [
  'company_discovery',
  'person_research', 
  'market_analysis',
  'competitor_research'
] as const;

export const RESEARCH_STATUS_TYPES = [
  'pending',
  'processing',
  'completed',
  'failed'
] as const;

export const RESEARCH_FILTER_OPTIONS = [
  { value: 'all', label: 'All Jobs' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const;

export const RESEARCH_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
  { value: 'target', label: 'By Target' },
] as const;

// Utility functions
export const formatResearchDuration = (startTime: string, endTime?: string): string => {
  if (!endTime) return 'In progress...';
  
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const getResearchStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'text-yellow-400';
    case 'processing': return 'text-blue-400';
    case 'completed': return 'text-green-400';
    case 'failed': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export const formatAgentName = (agent: string): string => {
  return agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateSuccessRate = (completed: number, failed: number): number => {
  const total = completed + failed;
  return total > 0 ? (completed / total) * 100 : 0;
};

// Enhanced error handling
export class ResearchError extends Error {
  constructor(
    message: string,
    public code?: string,
    public jobId?: string,
    public operation?: string
  ) {
    super(message);
    this.name = 'ResearchError';
  }
}

// Configuration validation
export const validateResearchConfig = (): { isValid: boolean; missingFields: string[] } => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
    'NEXT_PUBLIC_APPWRITE_RESEARCH_COLLECTION_ID'
  ];
  
  const missingFields = requiredEnvVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

// Performance monitoring utilities
export const measurePerformance = <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> => {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Research operation "${operationName}" took ${duration.toFixed(2)}ms`);
      }
      
      resolve({ result, duration });
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ Research operation "${operationName}" failed after ${duration.toFixed(2)}ms:`, error);
      reject(error);
    }
  });
};

// README Documentation
export const PHASE_2_IMPLEMENTATION_NOTES = `
# Phase 2 Enhanced Implementation - Appwrite Database & UI

## What's New in Phase 2 Enhanced:

### 1. Enhanced Appwrite Service (research-enhanced.ts)
- **ResearchService Class**: Singleton pattern with comprehensive error handling
- **Advanced Filtering**: Status, date range, agent type, and search filters
- **Pagination Support**: Load more functionality with proper offset management
- **Statistics**: Real-time analytics and performance metrics
- **Job Operations**: Retry, duplicate, archive functionality
- **Type Safety**: Full TypeScript definitions with proper error types

### 2. Enhanced React Hooks (useResearch-enhanced.ts)
- **useResearchJobs**: Advanced state management with filters and pagination
- **useResearchJob**: Single job management with ownership validation
- **useAutoRefreshJobs**: Intelligent polling that stops when no active jobs
- **useResearchAnalytics**: Comprehensive analytics and insights
- **Performance**: Optimized with proper dependency arrays and memo

### 3. Enhanced UI Components
- **StatusBadgeEnhanced**: Modern design with icons, animations, and tooltips
- **ResearchAnalyticsDashboard**: Complete analytics with charts and trends
- **Enhanced Research Dashboard**: Professional layout with glass morphism
- **Responsive Design**: Mobile-first approach with proper breakpoints

### 4. Design System Consistency
- **Glass Morphism**: Consistent backdrop-blur and transparency effects
- **Color Scheme**: Proper semantic colors for status indicators
- **Typography**: Consistent font families and sizing
- **Spacing**: Uniform padding, margins, and gaps
- **Animations**: Smooth transitions and micro-interactions

### 5. Developer Experience
- **TypeScript**: 100% type coverage with proper interfaces
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Optimized queries and state management
- **Testing**: Built-in performance monitoring and debug utilities
- **Documentation**: Comprehensive inline documentation

## Migration Guide:

To use the enhanced components, update your imports:

\`\`\`typescript
// Old import
import { useResearchJobs } from '../lib/appwrite/useResearch';

// New enhanced import  
import { useResearchJobs } from '../lib/appwrite/useResearch-enhanced';
\`\`\`

## Performance Improvements:

1. **Pagination**: Only loads 25 jobs at a time instead of all jobs
2. **Intelligent Refresh**: Only refreshes when there are active jobs
3. **Optimized Queries**: Proper indexing and query optimization
4. **State Management**: Reduced re-renders with proper memoization
5. **Error Recovery**: Graceful degradation and retry mechanisms

## UI/UX Enhancements:

1. **Modern Design**: Glass morphism and consistent spacing
2. **Better Accessibility**: Proper ARIA labels and keyboard navigation
3. **Status Indicators**: Enhanced badges with icons and animations
4. **Search & Filter**: Advanced filtering with real-time search
5. **Analytics**: Built-in dashboard for research insights
6. **Responsive**: Mobile-first design that works on all devices

This enhanced implementation provides a solid foundation for scaling the research system
while maintaining excellent performance and user experience.
`;