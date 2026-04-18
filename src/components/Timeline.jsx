// src/components/Timeline.jsx

const TYPE_STYLES = {
  sightings:     'bg-red-500/10 text-red-400 border border-red-500/20',
  messages:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  checkins:      'bg-green-500/10 text-green-400 border border-green-500/20',
  personalNotes: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  anonymousTips: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
};

const TYPE_DOT = {
  sightings:     'bg-red-500',
  messages:      'bg-blue-500',
  checkins:      'bg-green-500',
  personalNotes: 'bg-purple-500',
  anonymousTips: 'bg-amber-500',
};

export default function Timeline({ clues, selectedLocation, onLocationClick }) {
  if (clues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-slate-600 font-mono text-sm">
        <span className="text-3xl mb-3">🔍</span>
        <p>Bu konuma ait kayıt bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clues.map((clue, idx) => {
        const dotClass   = TYPE_DOT[clue.type]   || 'bg-slate-500';
        const badgeClass = TYPE_STYLES[clue.type] || 'bg-slate-700 text-slate-300';
        const isGeoTagged = !!clue.coords;

        return (
          <div
            key={`${clue.id}-${idx}`}
            className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800"
          >
            {/* Timeline dot */}
            <div className={`absolute left-[-4px] top-3 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)] ${dotClass}`} />

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all duration-200 group">
              {/* Top row */}
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${badgeClass}`}>
                  {clue.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{clue.date}</span>
              </div>

              {/* Location — clickable if it has coords */}
              <button
                onClick={() => isGeoTagged && onLocationClick(clue.location)}
                className={`text-slate-100 font-bold text-left mb-1 leading-tight w-full ${
                  isGeoTagged
                    ? 'hover:text-amber-400 cursor-pointer transition-colors'
                    : 'cursor-default'
                }`}
              >
                {isGeoTagged && (
                  <span className="inline-block mr-1 text-amber-500 text-xs">📍</span>
                )}
                {clue.location}
              </button>

              {/* Content */}
              <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-3">
                "{clue.content}"
              </p>

              {/* Footer */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-[10px] bg-slate-800 text-amber-500 px-2 py-1 rounded-md font-bold">
                  KİŞİ: {clue.person}
                </span>
                {isGeoTagged && (
                  <span className="text-[10px] bg-slate-800 text-green-400 px-2 py-1 rounded-md font-bold">
                    📡 GPS
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
