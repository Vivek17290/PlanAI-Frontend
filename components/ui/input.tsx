import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      {...props}
      className={`border border-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${className || ""}`}
    />
  );
};
