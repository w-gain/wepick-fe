import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'info' | 'error' | 'loading';
export type Notice = { id: number; title: string; description?: string; tone: ToastTone };
export type ToastContextValue = {
  notify: (notice: Omit<Notice, 'id'>) => void;
  clear: () => void;
  setSuspended: (suspended: boolean) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
