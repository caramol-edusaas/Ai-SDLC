// src/components/ui/TextField.jsx
import React from "react";
import { cn } from "../../utils/cn";

export const TextField = ({ label, error, className, id, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5 align-left text-left">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-textMain font-base"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border-color)] text-[var(--input-text)] rounded-themeInput placeholder-[var(--input-placeholder)] shadow-[var(--input-shadow)] transition-all duration-200 focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary font-base",
          error &&
            "border-[var(--danger-color)] focus:border-[var(--danger-color)] focus:ring-[var(--danger-color)]",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-[var(--danger-color)] font-base mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
