import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-800"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "w-full h-10 px-3 py-2 bg-white rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent transition-colors disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
              icon && "pl-9",
              error &&
                "border-[#B91C1C] focus:ring-[#B91C1C] focus:border-transparent",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-[#B91C1C]">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

