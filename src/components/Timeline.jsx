// src/components/Timeline.jsx
import { Fragment } from 'react';
import StatusBadge, { DOT_COLORS } from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

const parseCustomDate = (dateStr) => {
  if (!dateStr) return 0;
  const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
  if (!match) return new Date(dateStr).getTime() || 0;
  const [, d, m, y, h, min] = match;
  return new Date(`${y}-${m}-${d}T${h}:${min}:00`).getTime();
};

export default function Timeline({ clues, selectedLocation, onLocationClick, onClearFilter }) {
  if (clues.length === 0) {
    return (
      <EmptyState
        title={selectedLocation ? `"${selectedLocation}" için kayıt bulunamadı` : 'Kayıt Bulunamadı'}
        description={
          selectedLocation
            ? 'Bu lokasyona ait olay kaydı yok. Filtreyi kaldırıp tüm kayıtları görebilirsin.'
            : 'Arama kriterlerinizle eşleşen kayıt bulunmuyor.'
        }
        action={
          selectedLocation
            ? <Button variant="ghost" onClick={onClearFilter} aria-label="Konum filtresini kaldır">✕ Filtreyi Kaldır</Button>
            : null
        }
      />
    );
  }

  return (
    <ol aria-label="Kronolojik olay akışı" className="space-y-3">
      {clues.map((clue, idx) => {
        const dotClass   = DOT_COLORS[clue.type] ?? 'bg-slate-500';
        const isGeoTagged = !!clue.coords;

        // Proximity calculation (comparing with the older item, i.e., next in descending array)
        let hasProximity = false;
        let timeDiffMins = 0;
        const nextClue = clues[idx + 1];
        if (nextClue) {
          const t1 = parseCustomDate(clue.date);
          const t2 = parseCustomDate(nextClue.date);
          if (t1 && t2 && clue.location === nextClue.location) {
            const diffMs = Math.abs(t1 - t2);
            timeDiffMins = Math.round(diffMs / 60000);
            if (timeDiffMins < 15) {
              hasProximity = true;
            }
          }
        }

        return (
          <Fragment key={`${clue.id}-${idx}`}>
            <li
              className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-[-12px] before:w-px before:bg-border"
            >
              {/* Timeline dot */}
              <div
                aria-hidden="true"
                className={`absolute left-[-4px] top-3 w-2 h-2 rounded-full ${dotClass} shadow-[0_0_8px_rgba(245,158,11,0.3)]`}
              />

            <article
              aria-label={`${clue.type} kaydı — ${clue.location} — ${clue.person}`}
              className="bg-card p-4 rounded-xl border border-border hover:border-brand/40 hover:shadow-md transition-all duration-200"
            >
              {/* Header row */}
              <header className="flex justify-between items-start mb-2 gap-2">
                <StatusBadge type={clue.type} />
                <time
                  dateTime={clue.date}
                  className="text-[10px] font-mono text-secondary shrink-0"
                  aria-label={`Tarih: ${clue.date}`}
                >
                  {clue.date}
                </time>
              </header>

              {/* Location — clickable if geo-tagged */}
              {isGeoTagged ? (
                <button
                  type="button"
                  aria-label={`${clue.location} konumunu haritada göster`}
                  onClick={() => onLocationClick(clue.location)}
                  className="flex items-center gap-1 text-primary font-bold text-left mb-1 leading-tight
                    hover:text-brand transition-colors focus:outline-none
                    focus-visible:ring-1 focus-visible:ring-brand rounded"
                >
                  <span aria-hidden="true" className="text-brand text-xs">📍</span>
                  {clue.location}
                </button>
              ) : (
                <h3 className="text-primary font-bold mb-1 leading-tight">{clue.location}</h3>
              )}

              {/* Content */}
              <p className="text-secondary text-sm leading-relaxed mb-3 line-clamp-3">
                "{clue.content}"
              </p>

              {/* Footer */}
              <footer className="flex gap-2 flex-wrap">
                {clue.normalizedPerson && (
                  <span className="text-[10px] bg-page border border-border text-brand px-2 py-1 rounded-md font-bold">
                    KİŞİ: {clue.normalizedPerson}
                  </span>
                )}
                {isGeoTagged && (
                  <StatusBadge type="gps" label="📡 GPS" />
                )}
              </footer>
            </article>
          </li>
          
          {/* Proximity Link rendered between idx and idx+1 */}
          {hasProximity && (
            <div className="relative pl-7 flex items-center mb-[-6px] mt-[-6px] z-10" aria-label={`${timeDiffMins} dakika sonra aynı bölgede`}>
              <div className="absolute left-[-4px] w-2 h-full flex flex-col items-center justify-center">
                <div className="w-px h-full bg-brand/30"></div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-brand bg-card px-2 py-0.5 rounded-md border border-brand/20 shadow-sm">
                <span className="animate-pulse">↕</span>
                <span>{timeDiffMins} dakika sonra - Aynı bölgede</span>
              </div>
            </div>
          )}
          </Fragment>
        );
      })}
    </ol>
  );
}
