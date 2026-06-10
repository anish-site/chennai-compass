export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <p className="hero-greeting">வணக்கம்! 🌞</p>
        <h1>
          Chennai, <em>from my lens</em>
        </h1>
        <p className="hero-tagline">
          The beaches, cafés, bajji stalls and hideouts I'd actually take you to — curated by a
          local, for my people.
        </p>
      </div>
      <div className="hero-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path
            d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z"
            fill="var(--cream)"
          />
        </svg>
      </div>
    </section>
  );
}
