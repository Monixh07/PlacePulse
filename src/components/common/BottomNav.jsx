import {
  Home,
  PlaySquare,
  Compass,
  MessageCircle,
  User,
} from 'lucide-react'

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
        className={currentPage === 'reels' ? 'active' : ''}
        onClick={() => setCurrentPage('reels')}
      >
        <PlaySquare size={20} />
        <span>Reels</span>
      </button>

      <button
        className={currentPage === 'explore' ? 'active' : ''}
        onClick={() => setCurrentPage('explore')}
      >
        <Compass size={20} />
        <span>Nearby</span>
      </button>

      <button
        className={currentPage === 'messages' ? 'active' : ''}
        onClick={() => setCurrentPage('messages')}
      >
        <MessageCircle size={20} />
        <span>Messages</span>
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