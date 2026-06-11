import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { tips } from '../data/tips';

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function TipsBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + tips.length) % tips.length);
  };

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % tips.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const tip = tips[index];

  return (
    <section
      className="tipsbar"
      aria-label="Tips for Chennai"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        setPaused(false);
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) go(delta < 0 ? 1 : -1);
      }}
    >
      <h2 className="tipsbar-label">
        <Lightbulb size={16} aria-hidden="true" /> Tips for Chennai
      </h2>
      <div className="tips-carousel">
        <button className="tip-nav" aria-label="Previous tip" onClick={() => go(-1)}>
          <ChevronLeft size={17} />
        </button>
        {/* key remounts the card so the slide-in animation replays per tip */}
        <div key={index} className="tip tip-current" role="status" aria-live="polite">
          <span className="tip-emoji" aria-hidden="true">
            {tip.emoji}
          </span>
          {tip.text}
        </div>
        <button className="tip-nav" aria-label="Next tip" onClick={() => go(1)}>
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="tip-dots" aria-hidden="true">
        {tips.map((t, i) => (
          <button
            key={t.text}
            tabIndex={-1}
            className={i === index ? 'tip-dot tip-dot-active' : 'tip-dot'}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
