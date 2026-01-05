// Icon components - defined outside to avoid React recreating them
const DefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
    <path d="M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77,12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z"></path>
  </svg>
)

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
    <path d="M128,60a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,60Zm0,64a20,20,0,1,1,20-20A20,20,0,0,1,128,124Zm0-112a92.1,92.1,0,0,0-92,92c0,77.36,81.64,135.4,85.12,137.83a12,12,0,0,0,13.76,0,259,259,0,0,0,42.18-39C205.15,170.57,220,136.37,220,104A92.1,92.1,0,0,0,128,12Zm31.3,174.71A249.35,249.35,0,0,1,128,216.89a249.35,249.35,0,0,1-31.3-30.18C80,167.37,60,137.31,60,104a68,68,0,0,1,136,0C196,137.31,176,167.37,159.3,186.71Z"></path>
  </svg>
)

// Map icon names to components
const iconMap = {
  user: DefaultIcon,
  location: LocationIcon
}

function Button({ children, onClick, variant = 'primary', iconName = 'user', disabled = false }) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 cursor-pointer'

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-red-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400'
  }

  const styleClass = `${baseStyles} ${variants[variant]}`

  // Get the icon component from the map
  const IconComponent = iconMap[iconName] || DefaultIcon

  return (
    <button
      className={styleClass}
      onClick={onClick}
      disabled={disabled}
    >
      <IconComponent />
      {children}
    </button>
  )
}

export default Button
