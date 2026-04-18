// src/components/ui/EmptyState.jsx
/**
 * Empty state illustration + message.
 * Props: title, description, action (optional ReactNode)
 */
export default function EmptyState({
  title = 'Kayıt Bulunamadı',
  description = 'Arama kriterleri ile eşleşen herhangi bir kayıt yok.',
  action,
}) {
  return (
    <section
      aria-label="Boş veri durumu"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* SVG illustration */}
      <div className="mb-5 opacity-30" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="36" cy="36" r="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
          <circle cx="36" cy="36" r="18" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
          <line x1="50" y1="50" x2="62" y2="62" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <circle cx="36" cy="36" r="3" fill="#f59e0b" opacity="0.6" />
        </svg>
      </div>
      <h3 className="text-slate-300 font-bold text-base mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
