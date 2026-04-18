// src/components/MapView.jsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Helper: re-centre map when selectedLocation changes ──────────────────────
function MapFocuser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 15, { animate: true, duration: 1 });
    }
  }, [coords, map]);
  return null;
}

// Color per clue type
const TYPE_COLORS = {
  sightings:     '#ef4444', // red
  messages:      '#3b82f6', // blue
  checkins:      '#22c55e', // green
  personalNotes: '#a855f7', // purple
  anonymousTips: '#f59e0b', // amber
};

export default function MapView({ clues, selectedLocation, onMarkerClick }) {
  // Group clues that have coords; deduplicate by location string
  const locationMap = {};
  clues.forEach(clue => {
    if (!clue.coords) return;
    const key = clue.location;
    if (!locationMap[key]) {
      locationMap[key] = { coords: clue.coords, location: key, clues: [] };
    }
    locationMap[key].clues.push(clue);
  });

  const markers = Object.values(locationMap);

  // Center of Ankara
  const ANKARA_CENTER = [39.9208, 32.8541];

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <MapContainer
        center={ANKARA_CENTER}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full rounded-2xl"
        style={{ minHeight: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map(({ coords, location, clues: locClues }) => {
          const isActive = selectedLocation === location;
          // Pick most "exciting" type color
          const dominantType = locClues[0]?.type;
          const color = TYPE_COLORS[dominantType] || '#f59e0b';

          return (
            <CircleMarker
              key={location}
              center={coords}
              radius={isActive ? 18 : 11}
              pathOptions={{
                color: isActive ? '#f59e0b' : color,
                fillColor: isActive ? '#f59e0b' : color,
                fillOpacity: isActive ? 0.95 : 0.75,
                weight: isActive ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onMarkerClick(location),
              }}
            >
              <Popup>
                <div className="font-sans">
                  <p className="font-bold text-amber-400 text-sm mb-1">{location}</p>
                  <p className="text-slate-300 text-xs">{locClues.length} kayıt mevcut</p>
                  <ul className="mt-2 space-y-1">
                    {locClues.slice(0, 4).map((c, i) => (
                      <li key={i} className="text-xs text-slate-400">
                        <span className="text-slate-300">{c.person}</span> — {c.type}
                      </li>
                    ))}
                    {locClues.length > 4 && (
                      <li className="text-xs text-slate-500">+{locClues.length - 4} daha...</li>
                    )}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Auto-focus when a location is selected */}
        {selectedLocation && locationMap[selectedLocation] && (
          <MapFocuser coords={locationMap[selectedLocation].coords} />
        )}
      </MapContainer>

      {/* Location legend pill */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span
            key={type}
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur text-slate-300 font-mono border border-slate-700"
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
