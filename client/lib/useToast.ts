"use client";
import { useState, useEffect } from 'react';
import { toastManager, Toast } from './toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  return {
    toasts,
    toast: toastManager,
  };
}