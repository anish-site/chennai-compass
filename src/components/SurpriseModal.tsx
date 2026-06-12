import { useState } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import Modal from './Modal';
import PlaceCard from './PlaceCard';
import type { Place } from '../data/places';
import { pickRandom } from '../utils/random';

export default function SurpriseModal({
  places,
  onClose,
}: {
  places: Place[];
  onClose: () => void;
}) {
  const [pick, setPick] = useState<Place | undefined>(() => pickRandom(places));
  // bump a key so the card replays its reveal animation on every re-roll
  const [reveal, setReveal] = useState(0);

  const reroll = () => {
    setPick((current) => pickRandom(places, current));
    setReveal((r) => r + 1);
  };

  return (
    <Modal titleId="surprise-title" onClose={onClose}>
      <h2 id="surprise-title">
        <Sparkles size={20} aria-hidden="true" /> Surprise me!
      </h2>
      <p className="modal-intro">The city picked one for you. ✨</p>
      {pick && (
        <div key={reveal} className="surprise-stage" data-testid="surprise-pick">
          <span className="sparkle sparkle-1" aria-hidden="true">
            ✦
          </span>
          <span className="sparkle sparkle-2" aria-hidden="true">
            ✧
          </span>
          <span className="sparkle sparkle-3" aria-hidden="true">
            ⋆
          </span>
          <PlaceCard place={pick} index={0} />
        </div>
      )}
      <button className="pill-btn pill-btn-solid surprise-again" onClick={reroll}>
        <Wand2 size={15} aria-hidden="true" /> Surprise me again
      </button>
    </Modal>
  );
}
