export function Dropdown({ options, value, onChange, placeholder, disabled, className = '' }) {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg bg-white text-gray-700
        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
        disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-300
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
