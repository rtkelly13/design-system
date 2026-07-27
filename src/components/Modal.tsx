import type { ReactNode } from 'react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg bg-zinc-900 border-4 border-white shadow-hard-lg font-mono ${className}`.trim()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-black border-b-2 border-white px-6 py-4">
          <h3 className="font-display text-xl font-bold uppercase text-white tracking-wider">
            [ {title} ]
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-brutalist-pink font-mono font-bold text-lg px-2 border-2 border-white bg-zinc-900 hover:bg-black transition-colors"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-white text-sm leading-relaxed font-sans">{children}</div>

        {/* Footer */}
        <div className="bg-black border-t-2 border-white px-6 py-4 flex justify-end gap-3">
          {footer || (
            <Button onClick={onClose} variant="pink" bracketed size="sm">
              CLOSE
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
