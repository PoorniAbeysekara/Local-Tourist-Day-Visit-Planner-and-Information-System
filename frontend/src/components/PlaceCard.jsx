import { Link } from 'react-router-dom';
import { usePlan } from '../PlanContext.jsx';
import { distLabel, feeLabel, hoursLabel, statusOf } from '../utils.js';

export function Photo({ place, className = '' }) {
  const url = place.photos?.[0]?.url;
  return url ? (
    <img className={`photo ${className}`} src={url} alt={place.name} loading="lazy" />
  ) : (
    <div className={`photo photo-empty ${className}`} aria-label="No photo yet">{place.name[0]}</div>
  );
}

export default function PlaceCard({ place }) {
  const plan = usePlan();
  const inPlan = plan.has(place.id);
  return (
    <article className="card">
      <Link to={`/places/${place.id}`} className="card-media">
        <Photo place={place} />
        <span className="chip chip-cat">{place.categories[0]}</span>
        <span className="chip chip-dist">{distLabel(place.distanceKm)}</span>
      </Link>
      <div className="card-body">
        <h3><Link to={`/places/${place.id}`}>{place.name}</Link></h3>
        <p className="meta">
          <span className={`status ${place.isOpenNow ? 'open' : 'closed'}`}>{statusOf(place)}</span>
          <span>{feeLabel(place)} · {hoursLabel(place)}</span>
        </p>
        <button className={inPlan ? 'btn btn-ghost' : 'btn'} onClick={() => (inPlan ? plan.remove(place.id) : plan.add(place))}>
          {inPlan ? 'Remove from plan' : '+ Add to plan'}
        </button>
      </div>
    </article>
  );
}
