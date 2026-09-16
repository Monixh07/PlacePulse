import { useState } from 'react'
import AppLayout from '../../components/common/AppLayout'
import Home from '../Home'
import Explore from '../Explore'
import Reels from '../Reels'
import Messages from '../Messages'
import PlaceDetails from '../PlaceDetails'
import BusinessDashboard from './BusinessDashboard'

function BusinessHome() {
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
          onCreateCampaign={() => {
            setSelectedPlace(null)
            setCurrentPage('profile')
          }}
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
      return <BusinessDashboard onOpenPlace={handleOpenPlace} />
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

export default BusinessHome