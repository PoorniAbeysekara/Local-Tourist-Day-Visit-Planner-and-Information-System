import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { usePlan } from '../PlanContext.jsx';
import { Photo } from '../components/PlaceCard.jsx';
import { distLabel, feeLabel, formatMinutes, hoursLabel, closedLabel, statusOf } from '../utils.js';

export default function PlaceDetail() {
  const { id } = useParams();
  const plan = usePlan();
  const [place, setPlace] = useState(null);
  const [err, setErr] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    setPlace(null);
    api(`/places/${id}`).then(setPlace).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <p className="empty error">{err}</p>;
  if (!place) return <p className="empty">Loading…</p>;

  const inPlan = plan.has(place.id);
  const photos = place.photos || [];
  const f = place.facilities || {};

  return (
    <div className="detail">
      <Link to="/" className="back">← All places</Link>
      {photos.length > 0 ? (
        <>
          <img className="photo hero-photo" src={photos[active]?.url} alt={photos[active]?.caption || place.name} />
          <div className="thumbs">
            {photos.map((p, i) => (
              <button key={i} className={i === active ? 'on' : ''} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}>
                <img src={p.url} alt="" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <Photo place={place} className="hero-photo" />
      )}

      <div className="detail-head">
        <div>
          <p className="muted">{place.categories.join(' · ')}</p>
          <h1>{place.name}</h1>
          <p><span className={`status ${place.isOpenNow ? 'open' : 'closed'}`}>{statusOf(place)}</span> {distLabel(place.distanceKm)} from Baddegama</p>
        </div>
        <button className={inPlan ? 'btn btn-ghost' : 'btn'} onClick={() => (inPlan ? plan.remove(place.id) : plan.add(place))}>
          {inPlan ? 'Remove from plan' : '+ Add to my plan'}
        </button>
      </div>

      {place.isTempClosed && <div className="notice notice-closure">This place is temporarily closed.</div>}
      {place.notices.map((n, i) => (
        <div key={i} className={`notice notice-${n.type}`}>{n.message}</div>
      ))}

      <div className="facts">
        <div>
          <span>Opening hours</span>
          <strong>{hoursLabel(place)}</strong>
          {closedLabel(place) && <div className="small muted" style={{ marginTop: 4 }}>Closed: {closedLabel(place)}</div>}
        </div>
        <div>
          <span>Entrance fee</span>
          <strong>
            {place.fees && (place.fees.foreignAdult > 0 || place.fees.local > 0) ? (
              <>
                Foreign Adult: LKR {place.fees.foreignAdult.toLocaleString()}<br/>
                Foreign Child: LKR {place.fees.foreignChild.toLocaleString()}<br/>
                Local: LKR {place.fees.local.toLocaleString()}
              </>
            ) : feeLabel(place)}
          </strong>
        </div>
        <div><span>Suggested visit</span><strong>{formatMinutes(place.visitDuration)}</strong></div>
        <div><span>Distance</span><strong>{distLabel(place.distanceKm)}</strong></div>
      </div>

      <section className="panel"><h2>About</h2><p>{place.description}</p></section>
      {place.travelTips && <section className="panel"><h2>Travel tips</h2><p>{place.travelTips}</p></section>}
      {(f.parking || f.restrooms || f.food) && (
        <section className="panel">
          <h2>Practical information</h2>
          <ul>
            {f.parking && <li>Parking: {f.parking}</li>}
            {f.restrooms && <li>Restrooms: {f.restrooms}</li>}
            {f.food && <li>Food: {f.food}</li>}
          </ul>
        </section>
      )}
      {(place.contact?.phone || place.contact?.website) && (
        <section className="panel">
          <h2>Contact</h2>
          {place.contact.phone && <p>{place.contact.phone}</p>}
          {place.contact.website && <p><a href={place.contact.website} target="_blank" rel="noreferrer">{place.contact.website}</a></p>}
        </section>
      )}
    </div>
  );
}
