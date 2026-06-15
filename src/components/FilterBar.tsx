import { useState } from 'react';
import { LocateFixed, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import {
  BEST_TIMES,
  CATEGORIES,
  SETTINGS,
  VIBES,
  type Category,
} from '../data/places';
import {
  countPanelFilters,
  EMPTY_FILTERS,
  type Filters,
  type PriceFilter,
} from '../utils/filterPlaces';
import type { GeoStatus } from '../hooks/useGeolocation';

const PRICE_OPTIONS: PriceFilter[] = ['Free', 'Paid', '₹', '₹₹', '₹₹₹'];
const DISTANCE_OPTIONS = [3, 5, 10];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export interface NearMe {
  active: boolean;
  status: GeoStatus;
  toggle: () => void;
}

interface Props {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  areas: string[];
  resultCount: number;
  nearMe: NearMe;
}

function nearMeLabel(nearMe: NearMe): string {
  if (nearMe.active && nearMe.status === 'locating') return 'Locating…';
  if (nearMe.status === 'denied') return 'Location off';
  if (nearMe.status === 'unsupported') return 'No location';
  return 'Near me';
}

export default function FilterBar({ filters, setFilters, areas, resultCount, nearMe }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelCount = countPanelFilters(filters);
  const anyActive =
    panelCount > 0 ||
    filters.categories.length > 0 ||
    filters.topOnly ||
    filters.search.trim() !== '';

  const chipRow = <T extends string>(
    label: string,
    options: readonly T[],
    selected: T[],
    onToggle: (value: T) => void
  ) => (
    <div className="filter-group" role="group" aria-label={label}>
      <span className="filter-group-label">{label}</span>
      <div className="chip-row">
        {options.map((opt) => (
          <button
            key={opt}
            className={`chip ${selected.includes(opt) ? 'chip-active' : ''}`}
            aria-pressed={selected.includes(opt)}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="filterbar">
      <div className="filterbar-top">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search places, areas, tags…"
            aria-label="Search places"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        <button
          className={`pill-btn filter-toggle ${nearMe.active ? 'filter-toggle-active' : ''}`}
          onClick={nearMe.toggle}
          aria-pressed={nearMe.active}
          disabled={nearMe.status === 'unsupported'}
        >
          <LocateFixed size={15} />
          {nearMeLabel(nearMe)}
        </button>
        <button
          className={`pill-btn filter-toggle ${panelOpen || panelCount > 0 ? 'filter-toggle-active' : ''}`}
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
        >
          <SlidersHorizontal size={15} />
          Filters
          {panelCount > 0 && <span className="filter-badge">{panelCount}</span>}
        </button>
      </div>

      <div className="chip-row category-row" role="group" aria-label="Category">
        <button
          className={`chip chip-top ${filters.topOnly ? 'chip-top-active' : ''}`}
          aria-pressed={filters.topOnly}
          title="Show only my top picks"
          onClick={() => setFilters((f) => ({ ...f, topOnly: !f.topOnly }))}
        >
          <Star size={13} aria-hidden="true" fill={filters.topOnly ? 'currentColor' : 'none'} />
          Top picks
        </button>
        <button
          className={`chip ${filters.categories.length === 0 ? 'chip-active' : ''}`}
          aria-pressed={filters.categories.length === 0}
          onClick={() => setFilters((f) => ({ ...f, categories: [] }))}
        >
          All
        </button>
        {CATEGORIES.map((cat: Category) => (
          <button
            key={cat}
            className={`chip ${filters.categories.includes(cat) ? 'chip-active' : ''}`}
            aria-pressed={filters.categories.includes(cat)}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                // Single-select: pick this category only, or clear it back to All.
                categories: f.categories[0] === cat ? [] : [cat],
              }))
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {panelOpen && (
        <div className="filter-panel">
          {nearMe.active && (
            <div className="filter-group" role="group" aria-label="Distance">
              <span className="filter-group-label">Distance</span>
              <div className="chip-row">
                {DISTANCE_OPTIONS.map((km) => (
                  <button
                    key={km}
                    className={`chip ${filters.maxKm === km ? 'chip-active' : ''}`}
                    aria-pressed={filters.maxKm === km}
                    onClick={() =>
                      setFilters((f) => ({ ...f, maxKm: f.maxKm === km ? null : km }))
                    }
                  >
                    Under {km} km
                  </button>
                ))}
              </div>
            </div>
          )}
          {chipRow('Price', PRICE_OPTIONS, filters.prices, (v) =>
            setFilters((f) => ({ ...f, prices: toggle(f.prices, v) }))
          )}
          {chipRow('Vibe', VIBES, filters.vibes, (v) =>
            setFilters((f) => ({ ...f, vibes: toggle(f.vibes, v) }))
          )}
          {chipRow('Best time', BEST_TIMES, filters.bestTimes, (v) =>
            setFilters((f) => ({ ...f, bestTimes: toggle(f.bestTimes, v) }))
          )}
          {chipRow('Area', areas, filters.areas, (v) =>
            setFilters((f) => ({ ...f, areas: toggle(f.areas, v) }))
          )}
          {chipRow('Setting', SETTINGS, filters.settings, (v) =>
            setFilters((f) => ({ ...f, settings: toggle(f.settings, v) }))
          )}
        </div>
      )}

      <div className="filterbar-meta">
        <span className="result-count">
          {resultCount} {resultCount === 1 ? 'spot' : 'spots'}
        </span>
        {anyActive && (
          <button className="clear-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
            <X size={13} /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}
