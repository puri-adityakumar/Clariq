import React from "react";
import Badge from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ResearchStatus = "pending" | "processing" | "completed" | "failed";

interface StatusBadgeProps {
  status: ResearchStatus;
  className?: string;
  showSpinner?: boolean; // allow override
}

type VariantKey = "default" | "success" | "warning" | "destructive" | "outline";
const statusConfig: Record<ResearchStatus, { label: string; variant: VariantKey; showSpinner?: boolean; tooltip: string }> = {
  pending: {
    label: "Pending",
    variant: "outline",
    showSpinner: false,
    tooltip: "Job has been created and will start shortly"
  },
  processing: {
    label: "Processing",
    variant: "default",
    showSpinner: true,
    tooltip: "Research is currently running"
  },
  completed: {
    label: "Completed",
    variant: "success",
    showSpinner: false,
    tooltip: "Research finished successfully"
  },
  failed: {
    label: "Failed",
    variant: "destructive",
    showSpinner: false,
    tooltip: "An error occurred while processing this job"
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, showSpinner }) => {
  const cfg = statusConfig[status];
  return (
    <div className={cn("group relative inline-flex", className)}>
  <Badge variant={cfg.variant} size="sm" className="gap-1">
        { (showSpinner ?? cfg.showSpinner) && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) }
        {cfg.label}
      </Badge>
      <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 scale-90 opacity-0 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white shadow-sm transition-all group-hover:scale-100 group-hover:opacity-100">
        {cfg.tooltip}
      </div>
    </div>
  );
};

export default StatusBadge;
