import { useEffect, useState } from 'react'
import ReelCard from '../components/common/ReelCard'
import PlaceCard from '../components/common/PlaceCard'
import EmptyState from '../components/common/EmptyState'
import CommentsModal from '../components/common/CommentsModal'
import { getReels, getPlaces, getAllUsers } from '../services/dataService'

function Home({ onOpenPlace }) {
  const [reels, setReels] = useState([])
  const [places, setPlaces] = useState([])
  const [users, setUsers] = useState([])
  const [activeCommentReel, setActiveCommentReel] = useState(null)

  const loadFeed = () => {
    setReels(getReels())
    setPlaces(getPlaces())
    setUsers(getAllUsers())
  }

  useEffect(() => {
    loadFeed()
    window.addEventListener('placepulse_data_changed', loadFeed)
    return () => window.removeEventListener('placepulse_data_changed', loadFeed)
  }, [])

  const getCreator = (reel) => {
    return users.find((user) => user.id === reel.creatorId)
  }

  const getPlace = (reel) => {
    return places.find((place) => place.id === reel.placeId)
  }

  const handleHorizontalWheel = (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Discover Places</h1>
        <p>Find places worth exploring through short-form creator reels.</p>
      </div>

      <section className="suggested-nearby-section">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>Suggested Nearby Places</h2>
        </div>
        {places.length > 0 && (
          <div className="suggested-nearby-scroll" onWheel={handleHorizontalWheel}>
            {places.map((place) => <PlaceCard key={place.id} place={place} onOpen={onOpenPlace} />)}
          </div>
        )}
      </section>

      <section className="feed-section">
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>For You</h2>
        </div>

        {reels.length === 0 && places.length === 0 ? (
          <EmptyState
            title="No places yet"
            message="Places and travel reels will appear here as they are added."
          />
        ) : (
          <div className="feed-list">
            {reels.map((reel) => {
              const creator = getCreator(reel)
              const place = getPlace(reel)

              if (!creator || !place) {
                return null
              }

              return (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  creator={creator}
                  place={place}
                  onOpenPlace={onOpenPlace}
                  onComment={() => setActiveCommentReel(reel)}
                />
              )
            })}

            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onOpen={onOpenPlace}
              />
            ))}
          </div>
        )}
      </section>

      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          onClose={() => setActiveCommentReel(null)}
        />
      )}
    </div>
  )
}

export default Home
