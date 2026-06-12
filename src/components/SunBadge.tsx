import { useEffect, useState } from 'react';
import { Sunrise, Sunset } from 'lucide-react';
import { formatCountdown, nextSunEvent } from '../utils/sun';

/** Live "sunset in 1h 12m" pill for Chennai — computed locally, no API. */
export default function SunBadge() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const event = nextSunEvent(now);
  const Icon = event.kind === 'sunrise' ? Sunrise : Sunset;

  return (
    <p className="hero-sun" role="status">
      <Icon size={16} aria-hidden="true" />
      {event.kind === 'sunrise' ? 'Sunrise' : 'Sunset'} in {formatCountdown(now, event.at)}
    </p>
  );
}
