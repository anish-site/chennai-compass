import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import Modal from './Modal';
import { CATEGORY_META, places } from '../data/places';
import { passportUrl } from '../utils/passport';
import { SITE } from '../utils/seo';

interface Props {
  visited: string[];
  onClose: () => void;
}

export default function PassportModal({ visited, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const stamped = places.filter((p) => visited.includes(p.id));
  const url = passportUrl(visited, SITE.url);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is also visible below for manual copy.
    }
  };

  const share = async () => {
    const text = `My Chennai passport: ${stamped.length}/${places.length} spots stamped 🧭`;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'My Chennai passport', text, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    void copy();
  };

  return (
    <Modal titleId="passport-title" onClose={onClose}>
      <h2 id="passport-title">My passport 🛂</h2>
      <p className="passport-progress">
        <strong>{stamped.length}</strong> / {places.length} spots stamped
      </p>
      <div className="passport-bar" aria-hidden="true">
        <div
          className="passport-bar-fill"
          style={{ width: `${(stamped.length / places.length) * 100}%` }}
        />
      </div>

      <ul className="passport-grid">
        {places.map((place) => {
          const isStamped = visited.includes(place.id);
          return (
            <li
              key={place.id}
              className={isStamped ? 'passport-stamp stamped' : 'passport-stamp'}
              title={place.name}
            >
              <span className="passport-emoji" aria-hidden="true">
                {CATEGORY_META[place.category].emoji}
              </span>
              <span className="passport-name">{place.name}</span>
              {isStamped && <Check size={13} className="passport-check" aria-label="visited" />}
            </li>
          );
        })}
      </ul>

      <div className="passport-actions">
        <button className="pill-btn pill-btn-solid" onClick={share}>
          <Share2 size={14} aria-hidden="true" /> Share passport
        </button>
        <button className="pill-btn" onClick={copy}>
          <Copy size={14} aria-hidden="true" /> {copied ? 'Copied!' : 'Copy backup link'}
        </button>
      </div>
      <p className="passport-note">
        Stamps live on this device. The backup link restores them anywhere — open it on a new
        phone and your passport follows you. Send it to yourself on WhatsApp and you're safe.
      </p>
    </Modal>
  );
}
