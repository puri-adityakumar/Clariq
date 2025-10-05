"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "animate-pulse rounded-md bg-white/10", 
        className
      )} 
    />
  );
}

export function ResearchJobSkeleton() {
  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-8 w-20 rounded-md" />
      </td>
    </tr>
  );
}

export function ResearchDashboardSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-neutral-900/60">
      <table className="w-full text-sm">
        <thead className="text-left text-white/60">
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 font-medium">Target</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Agents</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 3 }).map((_, i) => (
            <ResearchJobSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReportViewerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}