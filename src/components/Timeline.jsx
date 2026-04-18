// src/components/Timeline.jsx
import StatusBadge, { DOT_COLORS } from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

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

        return (
          <li
            key={`${clue.id}-${idx}`}
            className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800"
          >
            {/* Timeline dot */}
            <div
              aria-hidden="true"
              className={`absolute left-[-4px] top-3 w-2 h-2 rounded-full ${dotClass} shadow-[0_0_8px_rgba(245,158,11,0.3)]`}
            />

            <article
              aria-label={`${clue.type} kaydı — ${clue.location} — ${clue.person}`}
              className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all duration-200"
            >
              {/* Header row */}
              <header className="flex justify-between items-start mb-2 gap-2">
                <StatusBadge type={clue.type} />
                <time
                  dateTime={clue.date}
                  className="text-[10px] font-mono text-slate-500 shrink-0"
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
                  className="flex items-center gap-1 text-slate-100 font-bold text-left mb-1 leading-tight
                    hover:text-amber-400 transition-colors focus:outline-none
                    focus-visible:ring-1 focus-visible:ring-amber-400 rounded"
                >
                  <span aria-hidden="true" className="text-amber-500 text-xs">📍</span>
                  {clue.location}
                </button>
              ) : (
                <h3 className="text-slate-100 font-bold mb-1 leading-tight">{clue.location}</h3>
              )}

              {/* Content */}
              <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-3">
                "{clue.content}"
              </p>

              {/* Footer */}
              <footer className="flex gap-2 flex-wrap">
                {clue.normalizedPerson && (
                  <span className="text-[10px] bg-slate-800 text-amber-500 px-2 py-1 rounded-md font-bold">
                    KİŞİ: {clue.normalizedPerson}
                  </span>
                )}
                {isGeoTagged && (
                  <StatusBadge type="gps" label="📡 GPS" />
                )}
              </footer>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
