import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Place } from '../data/places';
import { buildDirectionsUrl, buildGoogleSearchUrl } from '../utils/links';

export default function PlaceCard({ place, index }: { place: Place; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  const openGoogle = () => {
    window.open(buildGoogleSearchUrl(place), '_blank', 'noopener,noreferrer');
  };

  const openDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(buildDirectionsUrl(place), '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }}
      role="link"
      tabIndex={0}
      aria-label={`${place.name} — open on Google`}
      onClick={openGoogle}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openGoogle();
      }}
    >
      <div className="card-media">
        {imgFailed ? (
          <div className="card-fallback" aria-hidden="true">
            {place.name.charAt(0)}
          </div>
        ) : (
          <img
            src={place.image}
            alt={place.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <span className="badge badge-category">{place.category}</span>
        <span className="badge badge-price">{place.price}</span>
      </div>
      <div className="card-body">
        <div className="card-title-row">
          <h3>{place.name}</h3>
          <button
            className="dir-btn"
            onClick={openDirections}
            aria-label={`Directions to ${place.name}`}
            title="Get directions"
          >
            <Navigation size={16} />
          </button>
        </div>
        <p className="card-area">
          <MapPin size={13} aria-hidden="true" /> {place.area}
        </p>
        <p className="card-desc">{place.description}</p>
        <div className="card-tags">
          {place.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
