import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    // iOS Safari
    (navigator as { standalone?: boolean }).standalone === true
  );
}

interface Props {
  /** 'pill' renders the standalone button; 'menu' renders a dropdown menu item. */
  variant?: 'pill' | 'menu';
  /** Called when the button is activated (e.g. to close the parent menu). */
  onAction?: () => void;
}

export default function InstallButton({ variant = 'pill', onAction }: Props) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || isStandalone()) return null;

  const handleClick = async () => {
    onAction?.();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      // No native prompt available (iOS Safari, desktop Firefox…): show how-to.
      setShowHelp(true);
    }
  };

  return (
    <>
      <button
        className={variant === 'menu' ? 'menu-item' : 'pill-btn pill-btn-solid'}
        role={variant === 'menu' ? 'menuitem' : undefined}
        onClick={handleClick}
      >
        <Download size={15} aria-hidden="true" />
        {variant === 'menu' ? 'Install as app' : 'Install'}
      </button>
      {showHelp && (
        <div className="modal-backdrop" onClick={() => setShowHelp(false)}>
          <div
            className="modal modal-small"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowHelp(false)}
              aria-label="Close install instructions"
            >
              <X size={18} />
            </button>
            <h2 id="install-help-title">Add to your phone</h2>
            <ul className="install-steps">
              <li>
                <strong>iPhone (Safari):</strong> tap the Share button, then{' '}
                <em>Add to Home Screen</em>.
              </li>
              <li>
                <strong>Android (Chrome):</strong> tap the ⋮ menu, then <em>Install app</em> (or{' '}
                <em>Add to Home screen</em>).
              </li>
            </ul>
            <p className="install-note">
              It opens full-screen like a real app — no app store needed.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
