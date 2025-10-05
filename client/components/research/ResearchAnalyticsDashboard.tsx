"use client";
import React, { useState } from "react";
import { useResearchAnalytics } from "@/lib/appwrite/useResearch-enhanced";
import { useAuth } from "@/appwrite/AuthProvider";
import { cn } from "@/lib/utils";

// Chart data types
interface DailyStatsItem {
  date: string;
  completed: number;
  failed: number;
}

interface AgentPopularityItem {
  agent: string;
  count: number;
}

// Chart components (simplified for demonstration)
const SimpleBarChart = ({ data, className }: { data: DailyStatsItem[]; className?: string }) => (
  <div className={cn("flex items-end gap-1 h-24", className)}>
    {data.map((item, index) => (
      <div key={index} className="flex-1 flex flex-col items-center">
        <div 
          className="w-full bg-blue-400/30 rounded-t"
          style={{ 
            height: `${Math.max(4, (item.completed / Math.max(...data.map(d => d.completed)) * 100))}%` 
          }}
        />
        <div className="text-[8px] text-white/40 mt-1">
          {new Date(item.date).getDate()}
        </div>
      </div>
    ))}
  </div>
);

const SimplePieChart = ({ data, className }: { data: AgentPopularityItem[]; className?: string }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {data.slice(0, 5).map((item, index) => {
        const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
        
        return (
          <div key={item.agent} className="flex items-center gap-2 text-xs">
            <div className={cn("w-2 h-2 rounded-full", colors[index % colors.length])} />
            <span className="text-white/70 flex-1 truncate">
              {item.agent.replace(/_/g, ' ')}
            </span>
            <span className="text-white/90 font-medium">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface ResearchAnalyticsDashboardProps {
  className?: string;
}

export const ResearchAnalyticsDashboard: React.FC<ResearchAnalyticsDashboardProps> = ({ 
  className 
}) => {
  const { user } = useAuth();
  const {
    dailyStats,
    agentPopularity,
    avgSourcesPerJob,
    successRate,
    loading,
    error,
    refresh
  } = useResearchAnalytics(user?.$id || null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  if (loading) {
    return (
      <div className={cn("glass p-6 rounded-xl", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded" />
            ))}
          </div>
          <div className="h-32 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("glass p-6 rounded-xl", className)}>
        <div className="text-center text-red-400">
          <p className="text-sm">Failed to load analytics</p>
          <button 
            onClick={refresh}
            className="mt-2 text-xs text-white/60 hover:text-white underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("glass p-6 rounded-xl space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">
            Research Analytics
          </h3>
          <p className="text-sm text-white/60">
            Insights into your research patterns and performance
          </p>
        </div>
        
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period)}
              className={cn(
                "px-3 py-1 text-xs rounded-full transition",
                selectedTimeframe === period
                  ? "bg-white text-black font-medium"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-white/60">Success Rate</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {avgSourcesPerJob.toFixed(1)}
          </div>
          <div className="text-xs text-white/60">Avg Sources</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {dailyStats.reduce((sum, day) => sum + day.completed, 0)}
          </div>
          <div className="text-xs text-white/60">Completed Jobs</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {agentPopularity.length}
          </div>
          <div className="text-xs text-white/60">Agents Used</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-medium text-white mb-4">Daily Activity</h4>
          <SimpleBarChart data={dailyStats.slice(-14)} />
        </div>

        {/* Agent Popularity */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-medium text-white mb-4">Popular Agents</h4>
          <SimplePieChart data={agentPopularity} />
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">Recent Trends</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Most active day</span>
            <span className="text-white">
              {dailyStats.reduce((max, day) => 
                day.completed > max.completed ? day : max, 
                dailyStats[0]
              )?.date && new Date(
                dailyStats.reduce((max, day) => 
                  day.completed > max.completed ? day : max, 
                  dailyStats[0]
                ).date
              ).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex justify-between text-white/70">
            <span>Most used agent</span>
            <span className="text-white">
              {agentPopularity[0]?.agent.replace(/_/g, ' ')}
            </span>
          </div>
          
          <div className="flex justify-between text-white/70">
            <span>Average completion time</span>
            <span className="text-white">~12 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchAnalyticsDashboard;