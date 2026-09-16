import { MapPin, Search, Bell, MessageCircle } from 'lucide-react'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <MapPin size={22} />
        <span>PlacePulse</span>
      </div>

      <div className="navbar-actions">
        <button aria-label="Search">
          <Search size={20} />
        </button>

        <button aria-label="Messages">
          <MessageCircle size={20} />
        </button>

        <button aria-label="Notifications">
          <Bell size={20} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar