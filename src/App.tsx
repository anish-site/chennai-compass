import { useMemo, useState } from 'react';
import Header, { type MenuModal } from './components/Header';
import Hero from './components/Hero';
import TipsBar from './components/TipsBar';
import FilterBar from './components/FilterBar';
import PlaceGrid from './components/PlaceGrid';
import AboutModal from './components/AboutModal';
import TipsModal from './components/TipsModal';
import CityMapModal from './components/CityMapModal';
import MetroMapModal from './components/MetroMapModal';
import SurpriseModal from './components/SurpriseModal';
import { places } from './data/places';
import { EMPTY_FILTERS, filterPlaces, uniqueAreas } from './utils/filterPlaces';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeModal, setActiveModal] = useState<MenuModal | null>(null);
  const { theme, toggle } = useTheme();

  const areas = useMemo(() => uniqueAreas(places), []);
  const filtered = useMemo(() => filterPlaces(places, filters), [filters]);

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
        />
        <PlaceGrid places={filtered} onClear={() => setFilters(EMPTY_FILTERS)} />
      </main>
      <footer className="footer">
        Made with <span aria-hidden="true">🧡</span> in Chennai · tap a card to Google it, tap{' '}
        <span aria-hidden="true">➤</span> for directions
      </footer>
      <AboutModal open={activeModal === 'about'} onClose={closeModal} />
      {activeModal === 'tips' && <TipsModal onClose={closeModal} />}
      {activeModal === 'cityMap' && <CityMapModal onClose={closeModal} />}
      {activeModal === 'metro' && <MetroMapModal onClose={closeModal} />}
      {activeModal === 'surprise' && <SurpriseModal places={places} onClose={closeModal} />}
    </>
  );
}
