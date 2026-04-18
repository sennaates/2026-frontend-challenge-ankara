// src/components/ui/StatusBadge.jsx
/**
 * Reusable StatusBadge
 * Props: type ('sightings'|'messages'|'checkins'|'personalNotes'|'anonymousTips'|'live'|'error')
 *        label – override text; dot – show pulsing dot
 */
export const BADGE_STYLES = {
  live:          'bg-red-50 text-red-600 border border-red-200',
  sightings:     'bg-red-50 text-red-600 border border-red-200',
  messages:      'bg-indigo-50 text-indigo-600 border border-indigo-200',
  personalNotes: 'bg-purple-50 text-purple-600 border border-purple-200',
  checkins:      'bg-emerald-50 text-emerald-600 border border-emerald-200',
  anonymousTips: 'bg-orange-50 text-brand border border-orange-200',
  error:         'bg-red-50 text-red-600 border border-red-200',
  gps:           'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

export const DOT_COLORS = {
  live:          'bg-red-500',
  sightings:     'bg-red-500',
  messages:      'bg-indigo-500',
  personalNotes: 'bg-purple-500',
  checkins:      'bg-emerald-500',
  anonymousTips: 'bg-brand',
  gps:           'bg-emerald-500',
};

export default function StatusBadge({ type, label, dot = false, className = '' }) {
  const badgeClass = BADGE_STYLES[type] ?? 'bg-page text-secondary border border-border';
  const dotClass   = DOT_COLORS[type]   ?? 'bg-secondary';
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
