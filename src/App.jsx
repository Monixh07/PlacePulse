import { useState } from 'react'
import AppLayout from './components/common/AppLayout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import MapPage from './pages/MapPage'
import Profile from './pages/Profile'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  function renderPage() {
    if (currentPage === 'explore') {
      return <Explore />
    }

    if (currentPage === 'map') {
      return <MapPage />
    }

    if (currentPage === 'profile') {
      return <Profile />
    }

    return <Home />
  }

  return (
    <AppLayout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      {renderPage()}
    </AppLayout>
  )
}

export default App