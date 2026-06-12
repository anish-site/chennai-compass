import { useEffect, useMemo, useState } from 'react';
import Header, { type MenuModal } from './components/Header';
import Hero from './components/Hero';
import TipsBar from './components/TipsBar';
import FilterBar from './components/FilterBar';
import PlaceGrid from './components/PlaceGrid';
import AboutModal from './components/AboutModal';
import TipsModal from './components/TipsModal';
import CityMapModal from './components/CityMapModal';
import MetroMapModal from './components/MetroMapModal';
import PhrasebookModal from './components/PhrasebookModal';
import SurpriseModal from './components/SurpriseModal';
import PassportModal from './components/PassportModal';
import { places } from './data/places';
import { EMPTY_FILTERS, filterPlaces, uniqueAreas } from './utils/filterPlaces';
import { haversineKm } from './utils/geo';
import { useTheme } from './hooks/useTheme';
import { useCommunityPlaces } from './hooks/useCommunityPlaces';
import { useGeolocation } from './hooks/useGeolocation';
import { useVisited } from './hooks/useVisited';

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeModal, setActiveModal] = useState<MenuModal | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const { theme, toggle } = useTheme();
  const community = useCommunityPlaces();
  const geo = useGeolocation();
  const { visited, toggle: toggleVisited } = useVisited();

  // If permission gets denied, drop near-me mode and its distance filter.
  useEffect(() => {
    if (geo.status === 'denied' || geo.status === 'unsupported') {
      setNearMeActive(false);
      setFilters((f) => (f.maxKm === null ? f : { ...f, maxKm: null }));
    }
  }, [geo.status]);

  const toggleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setFilters((f) => (f.maxKm === null ? f : { ...f, maxKm: null }));
      return;
    }
    setNearMeActive(true);
    if (!geo.coords) geo.request();
  };

  // Curated places + approved friend recommendations from the Google Sheet.
  const allPlaces = useMemo(() => [...places, ...community], [community]);
  const userLoc = nearMeActive ? geo.coords : null;

  const located = useMemo(() => {
    if (!userLoc) return allPlaces;
    return allPlaces.map((p) =>
      p.coords ? { ...p, distanceKm: haversineKm(userLoc, p.coords) } : p
    );
  }, [allPlaces, userLoc]);

  const areas = useMemo(() => uniqueAreas(allPlaces), [allPlaces]);
  const filtered = useMemo(() => {
    const matching = filterPlaces(located, filters);
    if (!userLoc) return matching;
    return [...matching].sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );
  }, [located, filters, userLoc]);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <Header onOpen={setActiveModal} theme={theme} onToggleTheme={toggle} />
      <Hero onSurprise={() => setActiveModal('surprise')} />
      <main className="main">
        <TipsBar />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          areas={areas}
          resultCount={filtered.length}
          nearMe={{ active: nearMeActive, status: geo.status, toggle: toggleNearMe }}
        />
        <PlaceGrid
          places={filtered}
          onClear={() => setFilters(EMPTY_FILTERS)}
          visited={visited}
          onToggleVisited={toggleVisited}
        />
      </main>
      <footer className="footer">
        Made with <span aria-hidden="true">🧡</span> in Chennai · tap a card to Google it, tap{' '}
        <span aria-hidden="true">➤</span> for directions
      </footer>
      <AboutModal open={activeModal === 'about'} onClose={closeModal} />
      {activeModal === 'tips' && <TipsModal onClose={closeModal} />}
      {activeModal === 'cityMap' && <CityMapModal onClose={closeModal} />}
      {activeModal === 'metro' && <MetroMapModal onClose={closeModal} />}
      {activeModal === 'phrasebook' && <PhrasebookModal onClose={closeModal} />}
      {activeModal === 'surprise' && <SurpriseModal places={allPlaces} onClose={closeModal} />}
      {activeModal === 'passport' && <PassportModal visited={visited} onClose={closeModal} />}
    </>
  );
}
