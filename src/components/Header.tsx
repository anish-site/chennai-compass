import { Compass, Info } from 'lucide-react';
import InstallButton from './InstallButton';

export default function Header({ onAboutOpen }: { onAboutOpen: () => void }) {
  return (
    <header className="header">
      <span className="wordmark">
        <Compass size={22} strokeWidth={2.2} />
        Chennai Compass
      </span>
      <div className="header-actions">
        <button className="pill-btn" onClick={onAboutOpen}>
          <Info size={15} />
          About
        </button>
        <InstallButton />
      </div>
    </header>
  );
}
