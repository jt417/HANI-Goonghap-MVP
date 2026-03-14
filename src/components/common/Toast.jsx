import React from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { toneClasses } from '../../lib/constants';

export default function Toast() {
  const toastMessage = useAppStore((s) => s.toastMessage);
  const dismissToast = useAppStore((s) => s.dismissToast);
  if (!toastMessage) return null;

  const handleUndo = () => {
    toastMessage.onUndo?.();
    dismissToast();
  };

  return (
    <div className={`fixed top-6 right-8 z-50 flex items-center gap-3 max-w-md rounded-2xl border px-5 py-3.5 shadow-lg ${toneClasses[toastMessage.tone] || toneClasses.slate}`}>
      <div className="flex-1 text-sm font-medium">{toastMessage.text}</div>
      {toastMessage.onUndo && (
        <button
          onClick={handleUndo}
          className="shrink-0 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-white"
        >
          되돌리기
        </button>
      )}
      <button
        onClick={dismissToast}
        className="shrink-0 rounded-lg p-1 text-current opacity-60 transition hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
