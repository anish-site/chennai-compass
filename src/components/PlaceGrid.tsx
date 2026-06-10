import type { Place } from '../data/places';
import PlaceCard from './PlaceCard';

interface Props {
  places: Place[];
  onClear: () => void;
}

export default function PlaceGrid({ places, onClear }: Props) {
  if (places.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-emoji" aria-hidden="true">
          🌊
        </p>
        <h3>Aiyyo, nothing matches!</h3>
        <p>Try loosening a filter or two — the city has more to offer.</p>
        <button className="pill-btn pill-btn-solid" onClick={onClear}>
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid">
      {places.map((place, i) => (
        <PlaceCard key={place.id} place={place} index={i} />
      ))}
    </div>
  );
}
