import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const configs = {
          success: {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600',
          },
          error: {
            bg: 'bg-rose-50 border-rose-200 text-rose-900',
            icon: AlertCircle,
            iconColor: 'text-rose-600',
          },
          warning: {
            bg: 'bg-amber-50 border-amber-200 text-amber-900',
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
          },
          info: {
            bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
            icon: Info,
            iconColor: 'text-indigo-600',
          },
        };

        const c = configs[toast.type] || configs.info;
        const Icon = c.icon;

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-3 shadow-lg backdrop-blur-sm ${c.bg} transition-all animate-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`h-5 w-5 shrink-0 ${c.iconColor}`} />
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-1 hover:bg-black/5 text-slate-500 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
