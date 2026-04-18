// src/components/ui/Button.jsx
/**
 * Reusable Button
 * Props: variant ('primary'|'ghost'|'danger'), size ('sm'|'md'), loading, disabled, aria-label, onClick, children
 */
const VARIANTS = {
  primary: 'bg-amber-500 text-black hover:bg-amber-400 focus-visible:ring-amber-400',
  ghost:   'bg-slate-800 text-slate-300 hover:bg-slate-700 focus-visible:ring-slate-500',
  danger:  'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 focus-visible:ring-red-400',
  active:  'bg-amber-500 text-black',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  children,
  variant = 'ghost',
  size = 'sm',
  loading = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wider',
        'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.ghost,
        SIZES[size]    ?? SIZES.sm,
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
