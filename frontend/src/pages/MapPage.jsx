import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { usePlan } from '../PlanContext.jsx';
import MapView from '../components/MapView.jsx';

export default function MapPage() {
  const plan = usePlan();
  const [places, setPlaces] = useState([]);
  const [planOnly, setPlanOnly] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/places').then(setPlaces).catch(() => setErr('Could not load places for the map.'));
  }, []);

  const shown = planOnly ? plan.items : places;

  return (
    <>
      <div className="map-head">
        <h1>Map</h1>
        <label>
          <input type="checkbox" checked={planOnly} onChange={(e) => setPlanOnly(e.target.checked)} /> Show only my plan
        </label>
      </div>
      {err && <p className="empty error">{err}</p>}
      {planOnly && plan.items.length === 0 && <p className="empty">Your plan is empty. Add places to see them here.</p>}
      <MapView places={shown} route={planOnly} />
    </>
  );
}
