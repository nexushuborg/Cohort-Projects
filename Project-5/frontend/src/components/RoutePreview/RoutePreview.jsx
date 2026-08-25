import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import styles from './RoutePreview.module.css';

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
  const hasCoords = originLat && originLng && destinationLat && destinationLng;

  // Compute bounds to fit both markers
  const bounds = useMemo(() => {
    if (!hasCoords) return null;
    return [
      [originLat, originLng],
      [destinationLat, destinationLng],
    ];
  }, [originLat, originLng, destinationLat, destinationLng, hasCoords]);

  const center = useMemo(() => {
    if (!hasCoords) return [20.5937, 78.9629]; // India center
    return [
      (originLat + destinationLat) / 2,
      (originLng + destinationLng) / 2,
    ];
  }, [originLat, originLng, destinationLat, destinationLng, hasCoords]);

  const zoom = useMemo(() => {
    if (!hasCoords) return 5;
    // Calculate rough distance to determine zoom level
    const dist = Math.sqrt(
      Math.pow(originLat - destinationLat, 2) + Math.pow(originLng - destinationLng, 2)
    );
    if (dist > 5) return 5;
    if (dist > 2) return 7;
    if (dist > 0.5) return 10;
    return 12;
  }, [originLat, originLng, destinationLat, destinationLng, hasCoords]);

  if (!hasCoords) {
    return (
      <div className={`${variant === 'card' ? styles.mapCard : styles.mapDetail} ${className}`}>
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: '#F6F6F6', color: '#888', fontSize: '12px',
        }}>
          No route data
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
          position={[originLat, originLng]}
          icon={originIcon}
        />
        <Marker
          position={[destinationLat, destinationLng]}
          icon={destIcon}
        />
        <Polyline
          positions={[
            [originLat, originLng],
            [destinationLat, destinationLng],
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
