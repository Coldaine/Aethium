'use client';

import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionTitle: string;
  actionDescription: string;
  serviceName: string;
}

export default function WorkspaceConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  actionTitle,
  actionDescription,
  serviceName,
}: WorkspaceConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-none pointer-events-auto">
      <div className="w-full max-w-md bg-[#0f1422] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Google {serviceName}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">Confirmation Required</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{actionTitle}</h3>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-[#151c2e] p-3 rounded-xl border border-slate-800">
          {actionDescription}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          This operation will update your connected Google Workspace account. You can cancel with no side effects.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#151c2e] hover:bg-[#1a233a] border border-slate-700/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-md"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
}
