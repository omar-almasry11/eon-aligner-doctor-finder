export function DoctorCard({ doctor, isSelected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={`w-full p-4 text-left cursor-pointer transition-colors hover:bg-surface-hover border-b border-border
          ${isSelected ? 'bg-brand/10 border-l-4 border-l-brand' : ''}`}
      >
        <div className="flex gap-3">
          {doctor.photo ? (
            <img
              src={doctor.photo}
              alt=""
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg className="w-7 h-7 text-brand" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
          <div className="min-w-0">
            <span className="block font-medium text-ink truncate">{doctor.name}</span>
            <span className="block text-sm font-medium mb-1 text-ink-muted truncate">{doctor.clinic}</span>
            <span className="block text-sm text-ink-subtle">{doctor.city}, {doctor.country}</span>
          </div>
        </div>
      </button>
    </li>
  )
}
