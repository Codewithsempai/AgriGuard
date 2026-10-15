import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-w-[calc(100vw-1.5rem)] max-h-[90dvh] flex flex-col transform overflow-hidden rounded-3xl bg-white/95 p-4 sm:p-6 text-left shadow-2xl transition-all dark:bg-zinc-950/95 border border-zinc-200/90 dark:border-white/15 backdrop-blur-2xl z-10 my-auto`}
      >
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-zinc-200/80 dark:border-white/10 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white transition shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto pr-1 -mr-1">{children}</div>
      </div>
    </div>
  );
};
