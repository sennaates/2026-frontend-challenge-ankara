// src/components/ui/SearchInput.jsx
/**
 * Reusable Search Input
 * Props: value, onChange, placeholder, id, aria-label
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Ara...',
  id = 'search',
  'aria-label': ariaLabel = 'Arama',
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-sm pointer-events-none"
      >
        🔍
      </span>
      <input
        id={id}
        type="search"
        role="searchbox"
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
        className={`w-full bg-card border border-border rounded-full pl-9 pr-5 py-2 text-sm
          text-primary placeholder-secondary shadow-sm
          focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30
          transition-all
          ${className}`}
      />
    </div>
  );
}
