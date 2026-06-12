import { useEffect, useRef, useState } from 'react';
import { Compass, Info, Languages, Lightbulb, Map, Menu, Sparkles, TrainFront } from 'lucide-react';
import InstallButton from './InstallButton';
import ThemeToggle from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';

export type MenuModal = 'about' | 'tips' | 'cityMap' | 'metro' | 'surprise' | 'phrasebook';

interface Props {
  onOpen: (modal: MenuModal) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Header({ onOpen, theme, onToggleTheme }: Props) {
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

  const choose = (modal: MenuModal) => {
    setMenuOpen(false);
    onOpen(modal);
  };

  return (
    <header className="header">
      <span className="wordmark">
        <Compass size={22} strokeWidth={2.2} />
        Chennai Compass
      </span>
      <div className="header-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="menu-wrap" ref={menuRef}>
          <button
            className="menu-btn"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={18} aria-hidden="true" />
            <span className="menu-btn-label">Menu</span>
          </button>
          {menuOpen && (
            <div className="menu-dropdown" role="menu" aria-label="App menu">
              <button role="menuitem" className="menu-item" onClick={() => choose('surprise')}>
                <Sparkles size={15} aria-hidden="true" /> Surprise me
              </button>
              <button role="menuitem" className="menu-item" onClick={() => choose('about')}>
                <Info size={15} aria-hidden="true" /> About this guide
              </button>
              <button role="menuitem" className="menu-item" onClick={() => choose('tips')}>
                <Lightbulb size={15} aria-hidden="true" /> Tips for Chennai
              </button>
              <button role="menuitem" className="menu-item" onClick={() => choose('phrasebook')}>
                <Languages size={15} aria-hidden="true" /> Talk like a local
              </button>
              <button role="menuitem" className="menu-item" onClick={() => choose('cityMap')}>
                <Map size={15} aria-hidden="true" /> City map for geeks
              </button>
              <button role="menuitem" className="menu-item" onClick={() => choose('metro')}>
                <TrainFront size={15} aria-hidden="true" /> Chennai Metro map
              </button>
              <InstallButton variant="menu" onAction={() => setMenuOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
