import { useEffect, useRef } from 'react';
import { Heart, Sun, X } from 'lucide-react';

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" data-testid="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close about">
          <X size={18} />
        </button>
        <h2 id="about-title">வணக்கம், hi!</h2>

        <section className="about-section">
          <h3>
            <Heart size={16} /> About me
          </h3>
          <p>
            I'm a college student in Chennai who spends way too much weekend time hunting down
            cafés, beaches and bajji stalls. This app is my personal map of the city — every spot
            here is somewhere I'd actually take a friend.
          </p>
        </section>

        <section className="about-section">
          <h3>
            <Sun size={16} /> About Chennai
          </h3>
          <p>
            Chennai (formerly Madras) is a 380-year-old city on the Bay of Bengal — the gateway to
            South India. It's filter coffee at dawn, Carnatic music in December, beach sundal at
            dusk and biryani at midnight. It's hot, it's humid, and it grows on you until you
            can't imagine living anywhere else.
          </p>
          <p>
            Tap any card to look it up on Google, or hit the arrow for directions. Now go explore
            — the city's waiting.
          </p>
        </section>
      </div>
    </div>
  );
}
