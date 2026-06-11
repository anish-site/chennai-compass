import { useEffect, useRef, useState } from 'react';
import { Compass, Info, Menu } from 'lucide-react';
import InstallButton from './InstallButton';

export default function Header({ onAboutOpen }: { onAboutOpen: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <span className="wordmark">
        <Compass size={22} strokeWidth={2.2} />
        Chennai Compass
      </span>
      <div className="menu-wrap" ref={menuRef}>
        <button
          className="menu-btn"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Menu size={19} />
        </button>
        {menuOpen && (
          <div className="menu-dropdown" role="menu" aria-label="App menu">
            <button
              role="menuitem"
              className="menu-item"
              onClick={() => {
                setMenuOpen(false);
                onAboutOpen();
              }}
            >
              <Info size={15} aria-hidden="true" /> About this guide
            </button>
            <InstallButton variant="menu" onAction={() => setMenuOpen(false)} />
          </div>
        )}
      </div>
    </header>
  );
}
