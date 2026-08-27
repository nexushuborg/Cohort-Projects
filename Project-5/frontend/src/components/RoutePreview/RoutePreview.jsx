import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import styles from './RoutePreview.module.css';

// — Coordinate sanitizers —
const safeLat = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -90 && num <= 90 ? num : null;
};

const safeLng = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -180 && num <= 180 ? num : null;
};

function createSmallPin(color) {
  const bg = color === 'origin' ? '#06C167' : '#E11900';
  const label = color === 'origin' ? 'P' : 'D';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;border-radius:50% 50% 50% 0;
      background:${bg};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);
    "><span style="transform:rotate(45deg);color:white;font-size:10px;font-weight:700">${label}</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
}

const originIcon = createSmallPin('origin');
const destIcon = createSmallPin('dest');

export default function RoutePreview({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  variant = 'card', // 'card' | 'detail'
  className = '',
}) {
  // Sanitize all four coordinates to safe floats or null
  const oLat = safeLat(originLat);
  const oLng = safeLng(originLng);
  const dLat = safeLat(destinationLat);
  const dLng = safeLng(destinationLng);

  const hasValidRoute =
    oLat !== null &&
    oLng !== null &&
    dLat !== null &&
    dLng !== null;

  // Compute bounds to fit both markers
  const bounds = useMemo(() => {
    if (!hasValidRoute) return null;
    return [
      [oLat, oLng],
      [dLat, dLng],
    ];
  }, [oLat, oLng, dLat, dLng, hasValidRoute]);

  const center = useMemo(() => {
    if (!hasValidRoute) return [20.5937, 78.9629]; // India center
    return [
      (oLat + dLat) / 2,
      (oLng + dLng) / 2,
    ];
  }, [oLat, oLng, dLat, dLng, hasValidRoute]);

  const zoom = useMemo(() => {
    if (!hasValidRoute) return 5;
    const dist = Math.sqrt(
      Math.pow(oLat - dLat, 2) + Math.pow(oLng - dLng, 2)
    );
    if (dist > 5) return 5;
    if (dist > 2) return 7;
    if (dist > 0.5) return 10;
    return 12;
  }, [oLat, oLng, dLat, dLng, hasValidRoute]);

  if (!hasValidRoute) {
    return (
      <div className={`${variant === 'card' ? styles.mapCard : styles.mapDetail} ${className}`}>
        <div className={styles.noMapFallback}>
          <span>📍 Route details available upon booking</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${variant === 'card' ? styles.mapCard : styles.mapDetail} ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OSM'
        />
        <Marker
          position={[oLat, oLng]}
          icon={originIcon}
        />
        <Marker
          position={[dLat, dLng]}
          icon={destIcon}
        />
        <Polyline
          positions={[
            [oLat, oLng],
            [dLat, dLng],
          ]}
          pathOptions={{
            color: '#000000',
            weight: 2,
            opacity: 0.6,
            dashArray: '6, 8',
          }}
        />
      </MapContainer>
    </div>
  );
}
