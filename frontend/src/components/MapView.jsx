import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
import { BASE } from '../utils.js';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function Fit({ points }) {
  const map = useMap();
  const dep = JSON.stringify(points);
  useEffect(() => {
    const pts = JSON.parse(dep);
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40] });
    else if (pts.length === 1) map.setView(pts[0], 13);
  }, [dep, map]);
  return null;
}

// places: [{id,name,location,categories}], route: draw a line in this order (optional, REQ-3.4)
export default function MapView({ places, route = false }) {
  const points = places.map((p) => [p.location.lat, p.location.lng]);
  const fitPoints = points.length ? points : [[BASE.lat, BASE.lng]];
  return (
    <MapContainer center={[BASE.lat, BASE.lng]} zoom={11} className="map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Fit points={fitPoints} />
      {places.map((p) => (
        <Marker key={p.id} position={[p.location.lat, p.location.lng]}>
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p.categories?.join(', ')}
            <br />
            <Link to={`/places/${p.id}`}>View details</Link>
          </Popup>
        </Marker>
      ))}
      {route && points.length > 1 && <Polyline positions={points} pathOptions={{ color: '#1b5b3a', dashArray: '6 8' }} />}
    </MapContainer>
  );
}
