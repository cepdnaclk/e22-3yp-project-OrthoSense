import * as React from "react";
import { cn } from "@/lib/utils/cn";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ZapOff,
  HelpCircle,
  LucideIcon,
} from "lucide-react";
import { SensorHealthStatus } from "@/lib/types";

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  classes: string;
}

const statusConfigs: Record<SensorHealthStatus, StatusConfig> = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  degraded: {
    label: "Degraded",
    icon: AlertTriangle,
    classes: "bg-amber-50 text-amber-800 border-amber-200",
  },
  stale: {
    label: "Stale",
    icon: Clock,
    classes: "bg-slate-100 text-slate-700 border-slate-300",
  },
  invalid: {
    label: "Invalid",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  rail: {
    label: "Rail Fault",
    icon: ZapOff,
    classes: "bg-rose-50 text-rose-800 border-rose-300",
  },
  unverified: {
    label: "Unverified",
    icon: HelpCircle,
    classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: SensorHealthStatus;
  labelOverride?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  labelOverride,
  size = "md",
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfigs[status] || statusConfigs.unverified;
  const Icon = config.icon;
  const label = labelOverride || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full select-none",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.classes,
        className
      )}
      role="status"
      {...props}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

