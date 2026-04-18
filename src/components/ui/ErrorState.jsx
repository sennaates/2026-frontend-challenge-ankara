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
      <h3 className="text-red-500 font-bold text-base mb-1">{title}</h3>
      <p className="text-secondary text-sm max-w-xs leading-relaxed mb-5">{description}</p>
      {onRetry && (
        <button
          type="button"
          aria-label="Yeniden bağlan"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-100 transition-colors 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page shadow-sm"
        >
          ↺ Yeniden Bağlan
        </button>
      )}
    </section>
  );
}
