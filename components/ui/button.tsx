"use client";

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", asChild = false, className, ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
    
    const variantClass = variant === "outline" ? "border border-gray-300 text-gray-700 hover:bg-gray-100" : "bg-blue-500 text-white hover:bg-blue-600";
    
    const sizeClass = size === "sm" ? "px-2 py-1 text-sm" : size === "lg" ? "px-4 py-3 text-lg" : "px-3 py-2 text-base";

    const classes = [base, variantClass, sizeClass, className].filter(Boolean).join(" ");

    const Comp = asChild ? React.Fragment : "button";

    if (asChild) {
      return <Comp>{React.cloneElement(props.children as React.ReactElement, { className: classes, ref })}</Comp>;
    }

    return <button ref={ref} className={classes} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
