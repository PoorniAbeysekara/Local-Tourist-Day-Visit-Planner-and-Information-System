import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api, TOKEN_KEY } from '../api.js';
import { feeLabel } from '../utils.js';

const EMPTY = {
  name: '', description: '', categories: [], lat: '', lng: '', distanceKm: '', 
  feeForeignAdult: 0, feeForeignChild: 0, feeLocal: 0,
  open24h: false, openTime: '08:00', closeTime: '18:00', closedDays: [], closedOnPublicHolidays: false, visitDuration: 60, travelTips: '',
  parking: '', restrooms: '', food: '', phone: '', website: '', photoUrls: '',
  status: 'active', isTempClosed: false, noticeType: 'safety', noticeMessage: '',
};

function toForm(p) {
  const h = p.openingHours?.[0];
  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const openDays = p.openingHours?.map(x => x.day) || [];
  const closedDays = p.openingHours?.length ? allDays.filter(d => !openDays.includes(d)) : [];
  return {
    ...EMPTY, name: p.name, description: p.description, categories: p.categories,
    lat: p.location.lat, lng: p.location.lng, distanceKm: p.distanceKm, 
    feeForeignAdult: p.fees?.foreignAdult || 0, feeForeignChild: p.fees?.foreignChild || 0, feeLocal: p.fees?.local || 0,
    open24h: p.open24h, openTime: h?.open || '08:00', closeTime: h?.close || '18:00',
    closedDays, closedOnPublicHolidays: p.closedOnPublicHolidays || false,
    visitDuration: p.visitDuration, travelTips: p.travelTips,
    parking: p.facilities?.parking || '', restrooms: p.facilities?.restrooms || '', food: p.facilities?.food || '',
    phone: p.contact?.phone || '', website: p.contact?.website || '',
    photoUrls: (p.photos || []).map((x) => x.url).join('\n'),
    status: p.status, isTempClosed: p.isTempClosed,
    noticeType: p.notices?.[0]?.type || 'safety', noticeMessage: p.notices?.[0]?.message || '',
  };
}

function toPayload(f) {
  return {
    name: f.name, description: f.description, categories: f.categories,
    location: { lat: Number(f.lat), lng: Number(f.lng) },
    distanceKm: Number(f.distanceKm) || 0, 
    fees: {
      foreignAdult: Number(f.feeForeignAdult) || 0,
      foreignChild: Number(f.feeForeignChild) || 0,
      local: Number(f.feeLocal) || 0,
    },
    open24h: f.open24h,
    closedOnPublicHolidays: f.closedOnPublicHolidays,
    openingHours: f.open24h ? [] : [0, 1, 2, 3, 4, 5, 6].filter(d => !f.closedDays.includes(d)).map((day) => ({ day, open: f.openTime, close: f.closeTime })),
    visitDuration: Number(f.visitDuration) || 60, travelTips: f.travelTips,
    facilities: { parking: f.parking, restrooms: f.restrooms, food: f.food },
    contact: { phone: f.phone, website: f.website },
    photos: f.photoUrls.split('\n').map((s) => s.trim()).filter(Boolean).map((url) => ({ url })),
    status: f.status, isTempClosed: f.isTempClosed,
    notices: f.noticeMessage.trim() ? [{ type: f.noticeType, message: f.noticeMessage.trim() }] : [],
  };
}

function PlaceForm({ initial, categories, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const toggleCat = (slug) =>
    setF({ ...f, categories: f.categories.includes(slug) ? f.categories.filter((c) => c !== slug) : [...f.categories, slug] });
  const toggleClosedDay = (idx) =>
    setF({ ...f, closedDays: f.closedDays.includes(idx) ? f.closedDays.filter((d) => d !== idx) : [...f.closedDays, idx] });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await onSave(toPayload(f));
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setF((prev) => ({
        ...prev,
        photoUrls: prev.photoUrls ? `${prev.photoUrls}\n${data.url}` : data.url,
      }));
    } catch (e2) {
      setErr('Upload error: ' + e2.message);
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <label>Name *<input value={f.name} onChange={set('name')} required /></label>
      <fieldset>
        <legend>Categories *</legend>
        {categories.map((c) => (
          <label key={c.slug} className="inline"><input type="checkbox" checked={f.categories.includes(c.slug)} onChange={() => toggleCat(c.slug)} /> {c.name}</label>
        ))}
      </fieldset>
      <label>Description<textarea rows="3" value={f.description} onChange={set('description')} /></label>
      <div className="row">
        <label>Latitude *<input type="number" step="any" value={f.lat} onChange={set('lat')} required /></label>
        <label>Longitude *<input type="number" step="any" value={f.lng} onChange={set('lng')} required /></label>
        <label>Distance (km)<input type="number" step="any" value={f.distanceKm} onChange={set('distanceKm')} /></label>
        <label>Visit duration (min)<input type="number" min="5" value={f.visitDuration} onChange={set('visitDuration')} /></label>
      </div>
      <div className="row">
        <label>Foreign Adult Fee (LKR)<input type="number" min="0" value={f.feeForeignAdult} onChange={set('feeForeignAdult')} /></label>
        <label>Foreign Child Fee (LKR)<input type="number" min="0" value={f.feeForeignChild} onChange={set('feeForeignChild')} /></label>
        <label>Local Fee (LKR)<input type="number" min="0" value={f.feeLocal} onChange={set('feeLocal')} /></label>
      </div>
      <div className="row">
        <label className="inline"><input type="checkbox" checked={f.open24h} onChange={set('open24h')} /> Open 24 hours</label>
        {!f.open24h && (
          <>
            <label>Opens<input type="time" value={f.openTime} onChange={set('openTime')} /></label>
            <label>Closes<input type="time" value={f.closeTime} onChange={set('closeTime')} /></label>
          </>
        )}
      </div>
      {!f.open24h && (
        <fieldset>
          <legend>Closed Days</legend>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <label key={i} className="inline"><input type="checkbox" checked={f.closedDays.includes(i)} onChange={() => toggleClosedDay(i)} /> {d}</label>
          ))}
          <label className="inline" style={{marginLeft: 16}}><input type="checkbox" checked={f.closedOnPublicHolidays} onChange={set('closedOnPublicHolidays')} /> Public Holidays</label>
        </fieldset>
      )}
      <label>Travel tips<textarea rows="2" value={f.travelTips} onChange={set('travelTips')} /></label>
      <div className="row">
        <label>Parking<input value={f.parking} onChange={set('parking')} /></label>
        <label>Restrooms<input value={f.restrooms} onChange={set('restrooms')} /></label>
        <label>Food<input value={f.food} onChange={set('food')} /></label>
      </div>
      <div className="row">
        <label>Phone<input value={f.phone} onChange={set('phone')} /></label>
        <label>Website<input value={f.website} onChange={set('website')} /></label>
      </div>
    <div className="row">
        <label>Upload Photo from Computer (optional)
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
        </label>
        {uploading && <div style={{ alignSelf: 'center', color: '#666' }}>Uploading image...</div>}
      </div>
      <label>Photo URLs (one per line, 3–5 recommended)<textarea rows="3" value={f.photoUrls} onChange={set('photoUrls')} /></label>
      <div className="row">
        <label>Status
          <select value={f.status} onChange={set('status')}>
            <option value="active">Active (visible to tourists)</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </label>
        <label className="inline"><input type="checkbox" checked={f.isTempClosed} onChange={set('isTempClosed')} /> Temporarily closed</label>
      </div>
      <div className="row">
        <label>Notice type
          <select value={f.noticeType} onChange={set('noticeType')}>
            <option value="safety">Safety</option><option value="closure">Closure</option><option value="event">Event</option>
          </select>
        </label>
        <label className="grow">Notice message (shown on the place page)<input value={f.noticeMessage} onChange={set('noticeMessage')} /></label>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="row">
        <button className="btn btn-blue" disabled={busy}>{busy ? 'Saving…' : 'Save place'}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | place
  const [err, setErr] = useState('');
  const authed = !!localStorage.getItem(TOKEN_KEY);

  async function refresh() {
    try {
      setPlaces(await api('/places?includeInactive=true'));
    } catch (e) {
      setErr(e.message);
      if (!localStorage.getItem(TOKEN_KEY)) nav('/admin/login');
    }
  }

  useEffect(() => {
    if (!authed) return;
    api('/categories').then(setCategories).catch(() => {});
    refresh();
  }, []); // eslint-disable-line

  if (!authed) return <Navigate to="/admin/login" replace />;

  async function save(payload) {
    if (editing === 'new') await api('/places', { method: 'POST', body: payload });
    else await api(`/places/${editing.id}`, { method: 'PUT', body: payload });
    setEditing(null);
    refresh();
  }

  async function remove(p) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return; // REQ-5.3 / 5.6
    try {
      await api(`/places/${p.id}`, { method: 'DELETE' });
      refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    nav('/admin/login');
  }

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <h1>Place management</h1>
        <div>
          <Link to="/" className="back">Tourist site</Link>
          <button className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </header>
      <main className="admin-main">
        {err && <p className="error">{err}</p>}
        {editing ? (
          <PlaceForm initial={editing === 'new' ? EMPTY : toForm(editing)} categories={categories} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <>
            <button className="btn btn-blue" onClick={() => setEditing('new')}>+ Add place</button>
            <table className="table">
              <thead><tr><th>Name</th><th>Categories</th><th>Fee</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {places.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.categories.join(', ')}</td>
                    <td>{feeLabel(p)}</td>
                    <td>{p.isTempClosed ? 'Temporarily closed' : p.status}</td>
                    <td className="actions">
                      <button className="link" onClick={() => setEditing(p)}>Edit</button>
                      <button className="link danger" onClick={() => remove(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  );
}
