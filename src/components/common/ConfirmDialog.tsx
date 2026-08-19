import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  requireOkInput?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isDestructive = true,
  requireOkInput = true,
  onConfirm,
  onCancel,
}) => {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmed = !requireOkInput || confirmationText.trim().toUpperCase() === 'OK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="confirm-dialog"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {requireOkInput && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Escribe <span className="font-mono font-bold text-rose-600">OK</span> para confirmar:
            </label>
            <input
              type="text"
              placeholder="OK"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              autoFocus
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={!isConfirmed}
            onClick={() => {
              if (isConfirmed) onConfirm();
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
