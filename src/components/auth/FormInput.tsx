import React, { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  isPassword?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  id,
  type = 'text',
  className = '',
  ...props
}): React.JSX.Element => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Uppercase Letter-spaced label */}
      <label
        htmlFor={inputId}
        className="text-[10px] font-bold tracking-[0.14em] uppercase text-civic-500 dark:text-civic-400 select-none flex items-center justify-between"
      >
        <span>{label}</span>
      </label>

      {/* Input container with icon inside on left */}
      <div className="relative flex items-center group">
        <div className="absolute left-3.5 text-civic-400 dark:text-civic-500 group-focus-within:text-civic-800 dark:group-focus-within:text-civic-200 transition-colors pointer-events-none flex items-center justify-center">
          {icon}
        </div>

        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full bg-civic-50/80 hover:bg-civic-50 focus:bg-white dark:bg-civic-800/80 dark:hover:bg-civic-800 dark:focus:bg-civic-900 text-civic-900 dark:text-civic-100 text-sm font-normal pl-10 ${
            isPassword ? 'pr-10' : 'pr-3.5'
          } py-2.5 rounded-xl border ${
            error ? 'border-red-400 dark:border-red-500 ring-1 ring-red-400/20' : 'border-civic-200 dark:border-civic-700 focus:border-civic-500 dark:focus:border-civic-400'
          } outline-none transition-all duration-150 placeholder:text-civic-400 dark:placeholder:text-civic-500 focus:ring-2 focus:ring-civic-900/5 dark:focus:ring-civic-100/5 ${className}`}
          {...props}
        />

        {/* Password Show/Hide Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={(): void => setShowPassword((prev: boolean): boolean => !prev)}
            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            className="absolute right-3 text-civic-400 hover:text-civic-700 dark:text-civic-400 dark:hover:text-civic-200 transition-colors p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-civic-400 dark:focus:ring-civic-500 cursor-pointer"
          >
            {showPassword ? (
              <EyeSlash size={16} weight="regular" />
            ) : (
              <Eye size={16} weight="regular" />
            )}
          </button>
        )}
      </div>

      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          aria-live="polite"
          className="text-[11px] text-red-600 dark:text-red-400 font-medium tracking-tight mt-0.5"
        >
          {error}
        </span>
      )}
    </div>
  );
};
