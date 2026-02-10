'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      {children}
      {error && (
        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
      {!error && helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
}

