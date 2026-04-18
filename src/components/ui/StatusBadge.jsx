// src/components/ui/StatusBadge.jsx
/**
 * Reusable StatusBadge
 * Props: type ('sightings'|'messages'|'checkins'|'personalNotes'|'anonymousTips'|'live'|'error')
 *        label – override text; dot – show pulsing dot
 */
export const BADGE_STYLES = {
  sightings:     'bg-red-500/10 text-red-400 border border-red-500/20',
  messages:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  checkins:      'bg-green-500/10 text-green-400 border border-green-500/20',
  personalNotes: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  anonymousTips: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  live:          'bg-red-500/10 text-red-400 border border-red-500/30',
  error:         'bg-red-500/20 text-red-300 border border-red-500/40',
  gps:           'bg-green-500/10 text-green-400 border border-green-500/20',
};

export const DOT_COLORS = {
  sightings:     'bg-red-500',
  messages:      'bg-blue-500',
  checkins:      'bg-green-500',
  personalNotes: 'bg-purple-500',
  anonymousTips: 'bg-amber-500',
};

export default function StatusBadge({ type, label, dot = false, className = '' }) {
  const badgeClass = BADGE_STYLES[type] ?? 'bg-slate-700/50 text-slate-400 border border-slate-600';
  const dotClass   = DOT_COLORS[type]   ?? 'bg-slate-400';
  const text       = label ?? type;

  return (
    <span
      role="status"
      aria-label={`Tür: ${text}`}
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider',
        badgeClass,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotClass} ${type === 'live' ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      )}
      {text}
    </span>
  );
}
