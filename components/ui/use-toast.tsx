'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

interface ToastState {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type Action =
  | { type: 'ADD_TOAST'; toast: ToastState }
  | { type: 'UPDATE_TOAST'; toastId: string; toast: Partial<ToastState> }
  | { type: 'REMOVE_TOAST'; toastId?: string };

type State = { toasts: ToastState[] };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    if (dispatch) dispatch({ type: 'REMOVE_TOAST', toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};

export function removeToast(toastId: string) {
  toastTimeouts.delete(toastId);
  if (dispatch) dispatch({ type: 'REMOVE_TOAST', toastId });
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toastId ? { ...t, ...action.toast } : t
        ),
      };
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) return { ...state, toasts: [] };
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };
    default:
      return state;
  }
};

let dispatch: React.Dispatch<Action> | null = null;

export function useToast() {
  const [state, setState] = React.useReducer(reducer, { toasts: [] });
  dispatch = setState;

  const toast = React.useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastWithId: ToastState = {
      id,
      variant: props.variant ?? 'default',
      title: props.title,
      description: props.description,
    };
    dispatch!({ type: 'ADD_TOAST', toast: toastWithId });
    addToRemoveQueue(id);
    return { id, dismiss: () => removeToast(id) };
  }, []);

  return { toast, toasts: state.toasts };
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useReducer(reducer, { toasts: [] });
  dispatch = setState;

  return (
    <>
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col-reverse space-y-2 pointer-events-none sm:bottom-6 sm:right-6"
        role="region"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        {state.toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <div
              className={cn(
                'w-full max-w-xs flex items-start gap-3 rounded-xl border p-4 shadow-lg',
                'bg-white dark:bg-slate-800',
                t.variant === 'destructive'
                  ? 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              )}
            >
              {t.action && <div className="flex-shrink-0">{t.action}</div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {children}
    </>
  );
}
