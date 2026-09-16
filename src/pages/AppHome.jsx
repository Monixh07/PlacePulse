import { useAuth } from '../context/AuthContext'
import NormalHome from './normal/NormalHome'
import CreatorHome from './creator/CreatorHome'
import BusinessHome from './business/BusinessHome'

function AppHome() {
  const { currentUser } = useAuth()

  if (currentUser.role === 'creator') {
    return <CreatorHome />
  }

  if (currentUser.role === 'business') {
    return <BusinessHome />
  }

  return <NormalHome />
}

export default AppHome