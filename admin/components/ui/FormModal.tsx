'use client';

import React, { ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  maxWidth = '2xl',
}: FormModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !isSubmitting && !submitDisabled) {
      onSubmit(e);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {children}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              {onSubmit && (
                <button
                  type="submit"
                  disabled={isSubmitting || submitDisabled}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitLabel}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

