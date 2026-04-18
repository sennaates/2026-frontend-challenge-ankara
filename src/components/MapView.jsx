// src/components/MapView.jsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import StatusBadge, { BADGE_STYLES } from './ui/StatusBadge';

// ─── Fly-to helper ────────────────────────────────────────────────────────────
function MapFocuser({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { animate: true, duration: 1 });
  }, [coords, map]);
  return null;
}

// Color per clue type (used by CircleMarker path options)
const TYPE_FILL = {
  sightings:     '#ef4444',
  messages:      '#3b82f6',
  checkins:      '#22c55e',
  personalNotes: '#a855f7',
  anonymousTips: '#f59e0b',
};

const LEGEND_TYPES = Object.keys(TYPE_FILL);
const ANKARA_CENTER = [39.9208, 32.8541];

export default function MapView({ clues, selectedLocation, onMarkerClick }) {
  // Group clues with coords by location string
  const locationMap = {};
  clues.forEach(clue => {
    if (!clue.coords) return;
    if (!locationMap[clue.location]) {
      locationMap[clue.location] = { coords: clue.coords, location: clue.location, clues: [] };
    }
    locationMap[clue.location].clues.push(clue);
  });
  const markers = Object.values(locationMap);

  return (
    <div className="relative w-full h-full min-h-[400px]" role="region" aria-label="Ankara İstihbarat Haritası">
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
          const color    = TYPE_FILL[locClues[0]?.type] ?? '#f59e0b';

          return (
            <CircleMarker
              key={location}
              center={coords}
              radius={isActive ? 18 : 11}
              pathOptions={{
                color:       isActive ? '#f59e0b' : color,
                fillColor:   isActive ? '#f59e0b' : color,
                fillOpacity: isActive ? 0.95 : 0.75,
                weight:      isActive ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => onMarkerClick(location),
                keypress: (e) => { if (e.originalEvent.key === 'Enter') onMarkerClick(location); },
              }}
            >
              <Popup>
                <div className="font-sans min-w-[160px]">
                  <p className="font-bold text-amber-400 text-sm mb-1">{location}</p>
                  <p className="text-slate-300 text-xs mb-2">{locClues.length} kayıt mevcut</p>
                  <ul aria-label={`${location} kayıtları`} className="space-y-1">
                    {locClues.slice(0, 4).map((c, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="text-slate-300 font-medium">{c.person}</span>
                        <span aria-hidden="true">—</span>
                        <StatusBadge type={c.type} />
                      </li>
                    ))}
                    {locClues.length > 4 && (
                      <li className="text-xs text-slate-500 pt-1">+{locClues.length - 4} kayıt daha...</li>
                    )}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {selectedLocation && locationMap[selectedLocation] && (
          <MapFocuser coords={locationMap[selectedLocation].coords} />
        )}
      </MapContainer>

      {/* Legend */}
      <footer
        aria-label="Harita göstergesi"
        className="absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-1.5 max-w-xs"
      >
        {LEGEND_TYPES.map(type => (
          <StatusBadge
            key={type}
            type={type}
            dot
            className="bg-slate-950/80 backdrop-blur"
          />
        ))}
      </footer>
    </div>
  );
}
