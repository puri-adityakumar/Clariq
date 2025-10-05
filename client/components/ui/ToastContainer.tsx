"use client";
import React from 'react';
import { useToast } from '@/lib/useToast';
import { cn } from '@/lib/utils';
import { Toast, ToastType } from '@/lib/toast';

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-600 border-green-500 text-white',
  error: 'bg-red-600 border-red-500 text-white',
  warning: 'bg-yellow-600 border-yellow-500 text-white',
  info: 'bg-blue-600 border-blue-500 text-white',
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ⓘ',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200 ease-in-out',
        toastStyles[toast.type]
      )}
      role="alert"
    >
      <span className="flex-shrink-0 text-lg font-bold">
        {toastIcons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-lg opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, toast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toastItem: Toast) => (
        <div
          key={toastItem.id}
          className="animate-in slide-in-from-right-full duration-300"
        >
          <ToastItem
            toast={toastItem}
            onDismiss={toast.dismiss}
          />
        </div>
      ))}
    </div>
  );
}