import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  size?: "sm" | "md";
}

const variantClasses: Record<string, string> = {
  default: "bg-white/10 text-white border border-white/15",
  success: "bg-green-500/15 text-green-300 border border-green-400/25",
  warning: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/25",
  destructive: "bg-red-500/20 text-red-300 border border-red-400/25",
  outline: "bg-transparent text-white border border-white/20",
};

const sizeClasses: Record<string, string> = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
};

export function Badge({ className, variant = "default", size = "md", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-md tracking-tight select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
