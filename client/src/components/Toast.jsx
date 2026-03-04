import React from 'react';
import { CheckCircle, AlertCircle, X, Shield } from 'lucide-react';

function Toast({ message, type, onClose }) {
    const isError = type === 'error';

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in pointer-events-none">
            <div className={`
        flex items-center gap-4 px-5 py-3.5 rounded-xl border shadow-2xl pointer-events-auto
        backdrop-blur-xl transition-all duration-300
        ${isError
                    ? 'bg-rose-950/90 border-rose-500/50 text-rose-50'
                    : 'bg-surface-soft/90 border-border-main/50 text-text-main'}
      `}>
                <div className={`
          p-1.5 rounded-lg
          ${isError ? 'bg-rose-500/20 text-rose-500' : 'bg-brand-500/20 text-brand-500'}
        `}>
                    {isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                </div>

                <p className="text-sm font-semibold tracking-tight leading-none">{message}</p>

                <button
                    onClick={onClose}
                    className="ml-2 p-1 hover:bg-white/5 rounded transition-colors"
                >
                    <X size={14} className="opacity-40 hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}

export default Toast;
