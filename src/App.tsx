import { useMemo, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import PlaceGrid from './components/PlaceGrid';
import AboutModal from './components/AboutModal';
import { places } from './data/places';
import { EMPTY_FILTERS, filterPlaces, uniqueAreas } from './utils/filterPlaces';

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [aboutOpen, setAboutOpen] = useState(false);

  const areas = useMemo(() => uniqueAreas(places), []);
  const filtered = useMemo(() => filterPlaces(places, filters), [filters]);

  return (
    <>
      <Header onAboutOpen={() => setAboutOpen(true)} />
      <Hero />
      <main className="main">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          areas={areas}
          resultCount={filtered.length}
        />
        <PlaceGrid places={filtered} onClear={() => setFilters(EMPTY_FILTERS)} />
      </main>
      <footer className="footer">
        Made with <span aria-hidden="true">🧡</span> in Chennai · tap a card to Google it, tap{' '}
        <span aria-hidden="true">➤</span> for directions
      </footer>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
