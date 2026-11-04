import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-[#0F766E] text-white hover:bg-[#115E59] focus-visible:ring-[#0F766E] active:bg-[#134E4A]",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 active:bg-slate-300",
      destructive:
        "bg-[#B91C1C] text-white hover:bg-[#991B1B] focus-visible:ring-[#B91C1C] active:bg-[#7F1D1D]",
      ghost:
        "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 active:bg-slate-200",
      outline:
        "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus-visible:ring-[#0F766E]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

