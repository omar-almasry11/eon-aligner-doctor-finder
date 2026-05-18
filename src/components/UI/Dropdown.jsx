export function Dropdown({ options, value, onChange, placeholder, disabled, className = '' }) {
  return (
    <select
      aria-label={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className={`px-4 py-2 rounded-md bg-surface text-ink-muted border border-border
        focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent
        disabled:bg-surface-hover disabled:cursor-not-allowed
        ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
