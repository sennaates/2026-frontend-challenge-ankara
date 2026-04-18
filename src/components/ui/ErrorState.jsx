// src/components/ui/ErrorState.jsx
/**
 * Error state with retry action.
 * Props: title, description, onRetry
 */
export default function ErrorState({
  title = 'Bağlantı Hatası',
  description = 'İstihbarat akışı kesildi. Sunucuya ulaşılamıyor.',
  onRetry,
}) {
  return (
    <section
      role="alert"
      aria-label="Hata durumu"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* Animated error icon */}
      <div className="mb-5 relative" aria-hidden="true">
        <div className="w-16 h-16 rounded-full border-2 border-red-500/30 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-red-500/50 animate-ping absolute" />
          <span className="text-red-500 text-2xl relative z-10">!</span>
        </div>
      </div>
      <h3 className="text-red-400 font-bold text-base mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-5">{description}</p>
      {onRetry && (
        <button
          type="button"
          aria-label="Yeniden bağlan"
          onClick={onRetry}
          className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400
            text-sm font-bold hover:bg-red-500/20 transition focus:outline-none
            focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          ↺ Yeniden Bağlan
        </button>
      )}
    </section>
  );
}
