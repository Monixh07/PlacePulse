import { useState } from 'react'
import AppLayout from '../../components/common/AppLayout'
import Home from '../Home'
import Explore from '../Explore'
import Profile from '../Profile'
import Reels from '../Reels'
import Messages from '../Messages'
import PlaceDetails from '../PlaceDetails'

function NormalHome() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedPlace, setSelectedPlace] = useState(null)

  const handleOpenPlace = (place) => {
    setSelectedPlace(place)
  }

  const handleNavigate = (page) => {
    setSelectedPlace(null)
    setCurrentPage(page)
  }

  function renderContent() {
    if (selectedPlace) {
      return (
        <PlaceDetails
          place={selectedPlace}
          onBack={() => setSelectedPlace(null)}
        />
      )
    }

    if (currentPage === 'reels') {
      return <Reels onOpenPlace={handleOpenPlace} />
    }
    if (currentPage === 'explore') {
      return <Explore onOpenPlace={handleOpenPlace} />
    }
    if (currentPage === 'messages') {
      return <Messages />
    }
    if (currentPage === 'profile') {
      return <Profile onOpenPlace={handleOpenPlace} onNavigate={handleNavigate} />
    }

    return <Home onOpenPlace={handleOpenPlace} />
  }

  return (
    <AppLayout
      currentPage={selectedPlace ? '' : currentPage}
      setCurrentPage={handleNavigate}
    >
      {renderContent()}
    </AppLayout>
  )
}

export default NormalHome