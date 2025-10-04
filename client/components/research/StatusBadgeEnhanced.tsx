import React from "react";
import Badge from "../ui/badge";
import { cn } from "../../lib/utils";

export type ResearchStatus = "pending" | "processing" | "completed" | "failed";

interface StatusBadgeProps {
  status: ResearchStatus;
  className?: string;
  showSpinner?: boolean;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "glass";
}

// Enhanced spinner component
const Spinner = ({ className }: { className?: string }) => (
  <svg 
    className={cn("animate-spin", className)} 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Status icons
const StatusIcon = ({ status, className }: { status: ResearchStatus; className?: string }) => {
  const iconClasses = cn("flex-shrink-0", className);
  
  switch (status) {
    case "pending":
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "processing":
      return <Spinner className={iconClasses} />;
    case "completed":
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case "failed":
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

type VariantKey = "default" | "success" | "warning" | "destructive" | "outline";

const statusConfig: Record<ResearchStatus, { 
  label: string; 
  variant: VariantKey; 
  showSpinner?: boolean; 
  tooltip: string;
  colors: {
    default: string;
    minimal: string;
    glass: string;
  };
  pulse?: boolean;
}> = {
  pending: {
    label: "Pending",
    variant: "outline",
    showSpinner: false,
    tooltip: "Research job is queued and waiting to start",
    colors: {
      default: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      minimal: "text-yellow-400",
      glass: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 backdrop-blur-sm shadow-sm",
    },
    pulse: false,
  },
  processing: {
    label: "Processing",
    variant: "default",
    showSpinner: true,
    tooltip: "Research agents are actively working on this job",
    colors: {
      default: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      minimal: "text-blue-400",
      glass: "bg-blue-500/10 text-blue-400 border-blue-500/20 backdrop-blur-sm shadow-sm",
    },
    pulse: true,
  },
  completed: {
    label: "Completed",
    variant: "success",
    showSpinner: false,
    tooltip: "Research has been completed successfully",
    colors: {
      default: "bg-green-500/10 text-green-400 border-green-500/30",
      minimal: "text-green-400",
      glass: "bg-green-500/10 text-green-400 border-green-500/20 backdrop-blur-sm shadow-sm",
    },
    pulse: false,
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    showSpinner: false,
    tooltip: "Research job failed due to an error",
    colors: {
      default: "bg-red-500/10 text-red-400 border-red-500/30",
      minimal: "text-red-400",
      glass: "bg-red-500/10 text-red-400 border-red-500/20 backdrop-blur-sm shadow-sm",
    },
    pulse: false,
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className, 
  showSpinner,
  showIcon = true,
  size = "sm",
  variant = "default"
}) => {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: { badge: "text-xs px-2 py-1", icon: "h-3 w-3" },
    md: { badge: "text-sm px-2.5 py-1.5", icon: "h-3.5 w-3.5" },
    lg: { badge: "text-sm px-3 py-2", icon: "h-4 w-4" },
  };

  // For compatibility with existing Badge component
  if (variant === "default") {
    return (
      <div className={cn("group relative inline-flex", className)}>
        <Badge variant={config.variant} size="sm" className="gap-1.5">
          {(showSpinner ?? config.showSpinner) && showIcon && (
            <Spinner className="h-3 w-3" />
          )}
          {!config.showSpinner && showIcon && (
            <StatusIcon status={status} className="h-3 w-3" />
          )}
          {config.label}
        </Badge>
        <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 scale-90 opacity-0 rounded-lg bg-neutral-900/95 backdrop-blur-sm border border-white/10 px-3 py-2 text-xs text-white shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100 z-20">
          <div className="font-medium mb-1">{config.label}</div>
          <div className="text-white/70 text-[10px] leading-relaxed max-w-32 text-center">
            {config.tooltip}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2">
            <div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900/95" />
          </div>
        </div>
      </div>
    );
  }

  // Enhanced variants (minimal, glass)
  const variantClasses = {
    minimal: "font-medium",
    glass: "rounded-full border font-medium backdrop-blur-sm shadow-sm",
  };

  const baseClasses = cn(
    "inline-flex items-center gap-1.5 tracking-tight transition-all duration-200",
    config.colors[variant],
    sizeClasses[size].badge,
    variantClasses[variant],
    config.pulse && "animate-pulse",
    className
  );

  const BadgeContent = () => (
    <>
      {showIcon && (
        <StatusIcon status={status} className={sizeClasses[size].icon} />
      )}
      <span>{config.label}</span>
    </>
  );

  return (
    <div className="relative group">
      <span className={baseClasses}>
        <BadgeContent />
      </span>
      
      {/* Enhanced Tooltip */}
      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 scale-0 transform opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none z-20">
        <div className="bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl max-w-48 text-center">
          <div className="font-medium mb-1">{config.label}</div>
          <div className="text-white/70 text-[10px] leading-relaxed">
            {config.tooltip}
          </div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2">
          <div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900/95" />
        </div>
      </div>
    </div>
  );
};

export default StatusBadge;