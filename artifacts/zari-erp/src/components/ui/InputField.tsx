import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export default function InputField({ label, error, required, className = "", ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-500">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        className={`w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-cyan-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-cyan-900 focus:ring-2 focus:ring-cyan-900/10 disabled:opacity-50 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/10" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
