import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  small?: boolean;
}

/** Shared modal shell: backdrop, dialog, close button, Escape + backdrop close. */
export default function Modal({ titleId, onClose, children, small }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" data-testid="modal-backdrop" onClick={onClose}>
      <div
        className={small ? 'modal modal-small' : 'modal'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
