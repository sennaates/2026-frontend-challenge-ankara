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
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none"
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
        className="w-full bg-slate-900 border border-slate-700 rounded-full pl-9 pr-5 py-2 text-sm
          text-slate-200 placeholder-slate-500
          focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30
          transition duration-200"
      />
    </div>
  );
}
