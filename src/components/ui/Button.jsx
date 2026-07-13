// src/components/ui/Button.jsx
import React from "react";
import { cn } from "../../utils/cn";

export const Button = ({
  children,
  className,
  variant = "primary",
  isLoading,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "w-full flex items-center justify-center font-medium transition-all duration-200 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--button-shadow)]";

  const variants = {
    primary:
      "bg-primary text-[var(--button-text)] hover:bg-primaryDark font-heading",
    secondary:
      "bg-secondary text-[var(--button-text)] opacity-90 hover:opacity-100 font-heading",
    outline:
      "border border-[var(--border-color)] bg-transparent text-textMain hover:bg-gray-50",
  };

  // Dynamically reading dynamic border radii from our active theme
  const customRadius = {
    padding: "py-3 px-4",
    borderRadius: "rounded-themeBtn",
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        customRadius.borderRadius,
        customRadius.padding,
        className,
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--button-text)] border-t-transparent"></div>
      ) : (
        children
      )}
    </button>
  );
};
