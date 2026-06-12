import { useState } from 'react';
import {
  Bus,
  ExternalLink,
  MapPin,
  Moon,
  Navigation,
  Share2,
  Stamp,
  Sunrise,
  Sunset,
  Train,
  TrainFront,
} from 'lucide-react';
import type { BestTime, Place } from '../data/places';
import { CATEGORY_META } from '../data/places';
import { buildDirectionsUrl, buildGoogleSearchUrl } from '../utils/links';
import { sharePlace } from '../utils/shareCard';
import { formatDistance } from '../utils/geo';

const TIME_ICONS: Record<BestTime, { icon: typeof Sunrise; label: string }> = {
  Morning: { icon: Sunrise, label: 'Best in the morning' },
  Evening: { icon: Sunset, label: 'Best in the evening' },
  Night: { icon: Moon, label: 'Best at night' },
};

/** Decorative, stable per-place ticket number (10–99). */
function ticketNumber(id: string): number {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (hash % 90) + 10;
}

interface Props {
  place: Place;
  index: number;
  visited?: boolean;
  onToggleVisited?: (id: string) => void;
}

export default function PlaceCard({ place, index, visited = false, onToggleVisited }: Props) {
  const meta = CATEGORY_META[place.category];
  const [sharing, setSharing] = useState(false);

  const share = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sharing) return;
    setSharing(true);
    try {
      await sharePlace(place);
    } finally {
      setSharing(false);
    }
  };

  const openGoogle = () => {
    window.open(buildGoogleSearchUrl(place), '_blank', 'noopener,noreferrer');
  };

  const openGoogleFromButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGoogle();
  };

  const openDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(buildDirectionsUrl(place), '_blank', 'noopener,noreferrer');
  };

  const toggleVisited = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisited?.(place.id);
  };

  return (
    <article
      className={visited ? 'card card-visited' : 'card'}
      style={
        {
          animationDelay: `${Math.min(index * 55, 440)}ms`,
          '--accent': meta.accent,
        } as React.CSSProperties
      }
      role="link"
      tabIndex={0}
      aria-label={`${place.name} — open on Google`}
      onClick={openGoogle}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openGoogle();
      }}
    >
      {visited && (
        <span className="visited-stamp" aria-hidden="true">
          Visited ✓
        </span>
      )}
      <div className="ticket-top">
        <div className="stamp">
          <span className="stamp-emoji" aria-hidden="true">
            {meta.emoji}
          </span>
          <span className="stamp-label">{place.category}</span>
        </div>
        <div className="ticket-head">
          <div className="postmark-row">
            <span className="ticket-no">Nº {ticketNumber(place.id)}</span>
            <span className="postmark" aria-hidden="true">
              CHENNAI
              <br />
              600·001
            </span>
          </div>
          <h3>{place.name}</h3>
          <p className="route">
            <MapPin size={12} aria-hidden="true" /> via {place.area}
            {place.distanceKm !== undefined && (
              <span className="distance"> · {formatDistance(place.distanceKm)}</span>
            )}
          </p>
        </div>
      </div>

      <p className="message">“{place.description}”</p>

      <div className="info-strip">
        <span className="fare">
          Fare: <strong>{place.price}</strong>
        </span>
        <span className="times" aria-label="Best time to visit">
          {place.bestTime.map((time) => {
            const { icon: Icon, label } = TIME_ICONS[time];
            return <Icon key={time} size={15} aria-label={label} />;
          })}
        </span>
      </div>

      {place.transit && (
        <div className="transit" aria-label="Nearest public transport">
          {place.transit.metro && (
            <span title="Nearest Metro station">
              <TrainFront size={13} aria-label="Metro" /> {place.transit.metro}
            </span>
          )}
          {place.transit.rail && (
            <span title="Nearest suburban / MRTS station">
              <Train size={13} aria-label="Suburban rail" /> {place.transit.rail}
            </span>
          )}
          {place.transit.bus && (
            <span title="Nearest bus stop">
              <Bus size={13} aria-label="Bus stop" /> {place.transit.bus}
            </span>
          )}
        </div>
      )}

      <div className="card-tags">
        {place.community && (
          <span className="tag tag-community">
            <span aria-hidden="true">🤝</span> friend's pick
          </span>
        )}
        {place.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="perforation" aria-hidden="true" />

      <div className="ticket-actions">
        <button className="google-btn" onClick={openGoogleFromButton}>
          Google it <ExternalLink size={13} aria-hidden="true" />
        </button>
        <div className="action-icons">
          {onToggleVisited && (
            <button
              className={visited ? 'stamp-btn stamp-btn-active' : 'stamp-btn'}
              onClick={toggleVisited}
              aria-pressed={visited}
              aria-label={`Stamp ${place.name} as visited`}
              title={visited ? 'Unstamp' : 'Been here? Stamp it!'}
            >
              <Stamp size={16} />
            </button>
          )}
          <button
            className="share-btn"
            onClick={share}
            disabled={sharing}
            aria-label={`Share ${place.name}`}
            title="Share this postcard"
          >
            <Share2 size={16} />
          </button>
          <button
            className="dir-btn"
            onClick={openDirections}
            aria-label={`Directions to ${place.name}`}
            title="Get directions"
          >
            <Navigation size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
