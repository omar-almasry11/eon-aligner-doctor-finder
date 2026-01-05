export function DoctorCard({ doctor, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50
        ${isSelected ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''}`}
    >
      <div className="flex gap-3">
        {doctor.photo ? (
          <img
            src={doctor.photo}
            alt={doctor.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{doctor.name}</h3>
          <p className="text-sm text-teal-600 truncate">{doctor.clinic}</p>
          <p className="text-sm text-gray-500">{doctor.city}, {doctor.country}</p>
        </div>
      </div>
    </div>
  )
}
