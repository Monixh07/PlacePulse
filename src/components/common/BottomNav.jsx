import { Home, Compass, Map, User } from 'lucide-react'

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <button>
        <Home size={20} />
        <span>Home</span>
      </button>

      <button>
        <Compass size={20} />
        <span>Explore</span>
      </button>

      <button>
        <Map size={20} />
        <span>Map</span>
      </button>

      <button>
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  )
}

export default BottomNav