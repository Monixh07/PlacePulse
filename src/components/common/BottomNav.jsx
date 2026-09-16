import { Home, Compass, Map, User } from 'lucide-react'

function BottomNav({ currentPage, setCurrentPage }) {
  return (
    <nav className="bottom-nav">
      <button
        className={currentPage === 'home' ? 'active' : ''}
        onClick={() => setCurrentPage('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button
        className={currentPage === 'explore' ? 'active' : ''}
        onClick={() => setCurrentPage('explore')}
      >
        <Compass size={20} />
        <span>Explore</span>
      </button>

      <button
        className={currentPage === 'map' ? 'active' : ''}
        onClick={() => setCurrentPage('map')}
      >
        <Map size={20} />
        <span>Map</span>
      </button>

      <button
        className={currentPage === 'profile' ? 'active' : ''}
        onClick={() => setCurrentPage('profile')}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  )
}

export default BottomNav