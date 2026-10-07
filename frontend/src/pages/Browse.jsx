import { useEffect, useState } from 'react';
import { api } from '../api.js';
import PlaceCard from '../components/PlaceCard.jsx';

export default function Browse() {
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [state, setState] = useState('loading');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState('25');
  const [freeOnly, setFreeOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  useEffect(() => {
    api('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ category, maxDistance });
    if (q.trim()) params.set('q', q.trim());
    if (freeOnly) params.set('freeOnly', 'true');
    if (openNow) params.set('openNow', 'true');
    setState('loading');
    const t = setTimeout(() => {
      api(`/places?${params}`)
        .then((d) => { setPlaces(d); setState('ready'); })
        .catch(() => setState('error'));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, maxDistance, freeOnly, openNow]);

  const reset = () => { setQ(''); setCategory('all'); setMaxDistance('25'); setFreeOnly(false); setOpenNow(false); };

  return (
    <>
      <section className="hero">
        <h1>Discover Baddegama &amp; beyond</h1>
        <p>Browse places within 25 km, filter them, and build a one-day itinerary.</p>
        <input className="search" type="search" placeholder="Search places by name or category" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search places" />
        <div className="filters">
          <button className={`pill ${category === 'all' ? 'on' : ''}`} onClick={() => setCategory('all')}>All</button>
          {categories.map((c) => (
            <button key={c.slug} className={`pill ${category === c.slug ? 'on' : ''}`} onClick={() => setCategory(c.slug)}>{c.name}</button>
          ))}
        </div>
        <div className="filters filters-row">
          <label>Within{' '}
            <select value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}>
              {[5, 10, 15, 20, 25].map((d) => <option key={d} value={d}>{d} km</option>)}
            </select>
          </label>
          <label><input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} /> Free entry</label>
          <label><input type="checkbox" checked={openNow} onChange={(e) => setOpenNow(e.target.checked)} /> Open now</label>
          <button className="link" onClick={reset}>Clear filters</button>
        </div>
      </section>

      {state === 'loading' && <p className="empty">Loading places…</p>}
      {state === 'error' && <p className="empty error">Could not load places. Check that the server is running, then refresh.</p>}
      {state === 'ready' && places.length === 0 && (
        <p className="empty">No places match these filters. Try clearing a filter.</p>
      )}
      {state === 'ready' && places.length > 0 && (
        <>
          <p className="count">{places.length} place{places.length === 1 ? '' : 's'} found</p>
          <div className="grid">{places.map((p) => <PlaceCard key={p.id} place={p} />)}</div>
        </>
      )}
    </>
  );
}
