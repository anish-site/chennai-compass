import { useState } from 'react';
import { Camera, MapPin, Navigation } from 'lucide-react';
import type { Place } from '../data/places';
import { buildDirectionsUrl, buildGoogleSearchUrl } from '../utils/links';
import { usePlacePhoto } from '../hooks/usePlacePhoto';

export default function PlaceCard({ place, index }: { place: Place; index: number }) {
  const { src, attribution } = usePlacePhoto(place);
  const [failedSrcs, setFailedSrcs] = useState<string[]>([]);

  // Google Maps photo first, bundled image as backup, gradient as last resort.
  const currentSrc = [src, place.image].find((s) => s && !failedSrcs.includes(s));
  const isGooglePhoto = currentSrc === src && src !== place.image;

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
        {currentSrc ? (
          <img
            src={currentSrc}
            alt={place.name}
            loading="lazy"
            onError={() => setFailedSrcs((failed) => [...failed, currentSrc])}
          />
        ) : (
          <div className="card-fallback" aria-hidden="true">
            {place.name.charAt(0)}
          </div>
        )}
        <span className="badge badge-category">{place.category}</span>
        <span className="badge badge-price">{place.price}</span>
        {isGooglePhoto && attribution && (
          <span className="photo-credit">
            <Camera size={10} aria-hidden="true" /> {attribution}
          </span>
        )}
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
