import { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Button from '../Button/Button';
import styles from './MapPicker.module.css';

// Fix default Leaflet marker icon paths (webpack/vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// — Coordinate sanitizers —
const safeLat = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -90 && num <= 90 ? num : null;
};

const safeLng = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= -180 && num <= 180 ? num : null;
};

const fmtCoord = (val) => {
  const num = parseFloat(val);
  return !isNaN(num) ? num.toFixed(4) : '—';
};

// Custom pin icons
function createPinIcon(color) {
  const bg = color === 'origin' ? '#06C167' : '#E11900';
  const label = color === 'origin' ? 'P' : 'D';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${bg};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "><span style="transform:rotate(45deg);color:white;font-size:12px;font-weight:700">${label}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const originIcon = createPinIcon('origin');
const destIcon = createPinIcon('dest');

const MAP_CENTER = [20.5937, 78.9629]; // Center of India

// Component that listens for map clicks and places the correct pin
function MapClickHandler({ activePin, onPlacePin }) {
  useMapEvents({
    click(e) {
      onPlacePin(activePin, e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to fly to a location (for "Use Current Location")
function FlyToLocation({ position }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 15, { duration: 1.5 });
  }
  return null;
}

export default function MapPicker({
  originLat = 19.076,
  originLng = 72.8777,
  destLat = 18.5204,
  destLng = 73.8567,
  onOriginChange,
  onDestChange,
}) {
  const [activePin, setActivePin] = useState('origin');
  const [geoLoading, setGeoLoading] = useState(false);

  // Sanitize incoming props to safe floats
  const safeOriginLat = safeLat(originLat) ?? 19.076;
  const safeOriginLng = safeLng(originLng) ?? 72.8777;
  const safeDestLat = safeLat(destLat) ?? 18.5204;
  const safeDestLng = safeLng(destLng) ?? 73.8567;

  const handlePlacePin = useCallback((pin, lat, lng) => {
    const rounded = (v) => Math.round(v * 10000) / 10000;
    if (pin === 'origin') {
      onOriginChange?.(rounded(lat), rounded(lng));
    } else {
      onDestChange?.(rounded(lat), rounded(lng));
    }
  }, [onOriginChange, onDestChange]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        handlePlacePin(activePin, lat, lng);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        alert('Unable to retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const originPos = [safeOriginLat, safeOriginLng];
  const destPos = [safeDestLat, safeDestLng];

  return (
    <div className={styles.wrapper}>
      <div className={styles.dualMapGrid}>
        {/* Origin Map */}
        <div>
          <div className={styles.mapLabel}>
            📍 Pickup Point
            <span>— click map or drag pin</span>
          </div>
          <div className={styles.mapContainer}>
            <MapContainer
              center={originPos}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler activePin="origin" onPlacePin={handlePlacePin} />
              <Marker
                position={originPos}
                icon={originIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    handlePlacePin('origin', lat, lng);
                  },
                }}
              />
              {geoLoading && activePin === 'origin' && <FlyToLocation position={null} />}
            </MapContainer>
          </div>
          <div className={styles.controls}>
            <button
              className={styles.useLocationBtn}
              onClick={() => { setActivePin('origin'); handleUseCurrentLocation(); }}
              disabled={geoLoading}
            >
              📡 Use Current Location
            </button>
            <span className={styles.coords}>
              {fmtCoord(originLat)}, {fmtCoord(originLng)}
            </span>
          </div>
        </div>

        {/* Destination Map */}
        <div>
          <div className={styles.mapLabel}>
            🏁 Drop-off Point
            <span>— click map or drag pin</span>
          </div>
          <div className={styles.mapContainer}>
            <MapContainer
              center={destPos}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler activePin="dest" onPlacePin={handlePlacePin} />
              <Marker
                position={destPos}
                icon={destIcon}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    handlePlacePin('dest', lat, lng);
                  },
                }}
              />
            </MapContainer>
          </div>
          <div className={styles.controls}>
            <button
              className={styles.useLocationBtn}
              onClick={() => { setActivePin('dest'); handleUseCurrentLocation(); }}
              disabled={geoLoading}
            >
              📡 Use Current Location
            </button>
            <span className={styles.coords}>
              {fmtCoord(destLat)}, {fmtCoord(destLng)}
            </span>
          </div>
        </div>
      </div>
      <p className={styles.hint}>
        Click anywhere on the map or drag the pin to set exact coordinates. City and address fields below will be auto-displayed.
      </p>
    </div>
  );
}
