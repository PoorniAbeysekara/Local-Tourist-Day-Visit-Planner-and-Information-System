import { Link } from 'react-router-dom';
import { usePlan } from '../PlanContext.jsx';
import MapView from '../components/MapView.jsx';
import { BASE, formatMinutes, hoursLabel, travelMinutes } from '../utils.js';

export default function MyPlan() {
  const plan = usePlan();
  const { items } = plan;

  if (items.length === 0) {
    return (
      <div className="empty-plan">
        <h1>Your plan is empty</h1>
        <p>Browse places and add them to build your one-day itinerary.</p>
        <Link to="/" className="btn">Browse places</Link>
      </div>
    );
  }

  // Timeline: Baddegama -> stop 1 -> stop 2 ...
  let prev = BASE;
  let total = 0;
  const rows = items.map((p) => {
    const travel = travelMinutes(prev, p.location);
    prev = p.location;
    total += travel + p.visitDuration;
    return { p, travel, elapsed: total };
  });
  const travelTotal = rows.reduce((s, r) => s + r.travel, 0);
  const visitTotal = items.reduce((s, p) => s + p.visitDuration, 0);

  return (
    <>
      <div className="map-head">
        <h1>My one-day plan</h1>
        <button className="link" onClick={plan.clear}>Clear plan</button>
      </div>

      <div className="plan-layout">
        <ol className="timeline">
          <li className="tl-start"><strong>Start: {BASE.name}</strong></li>
          {rows.map(({ p, travel, elapsed }, i) => (
            <li key={p.id}>
              <p className="tl-travel">Travel about {formatMinutes(travel)}</p>
              <div className="tl-card">
                <div>
                  <h3><Link to={`/places/${p.id}`}>{i + 1}. {p.name}</Link></h3>
                  <p className="muted">Visit {formatMinutes(p.visitDuration)} · {hoursLabel(p)} · {formatMinutes(elapsed)} into the day</p>
                </div>
                <div className="tl-actions">
                  <button className="icon" onClick={() => plan.move(i, i - 1)} disabled={i === 0} aria-label={`Move ${p.name} up`}>↑</button>
                  <button className="icon" onClick={() => plan.move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move ${p.name} down`}>↓</button>
                  <button className="icon" onClick={() => plan.remove(p.id)} aria-label={`Remove ${p.name}`}>✕</button>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <aside className="summary">
          <h2>Day summary</h2>
          <dl>
            <dt>Stops</dt><dd>{items.length}</dd>
            <dt>Travel</dt><dd>{formatMinutes(travelTotal)}</dd>
            <dt>Visiting</dt><dd>{formatMinutes(visitTotal)}</dd>
            <dt>Total</dt><dd><strong>{formatMinutes(total)}</strong></dd>
          </dl>
          <p className="muted small">Travel times are estimates from straight-line distance. They do not include live traffic.</p>
        </aside>
      </div>

      <MapView places={items} route />
    </>
  );
}
