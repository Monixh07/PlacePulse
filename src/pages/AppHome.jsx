import { useAuth } from '../context/AuthContext'
import NormalHome from './normal/NormalHome'
import CreatorHome from './creator/CreatorHome'
import BusinessHome from './business/BusinessHome'
import AdminDashboard from './AdminDashboard'

function AppHome() {
  const { currentUser } = useAuth()

  if (currentUser.role === 'creator') {
    return <CreatorHome />
  }

  if (currentUser.role === 'business') {
    return <BusinessHome />
  }

  if (currentUser.role === 'admin' || currentUser.role === 'developer') {
    return <AdminDashboard />
  }

  return <NormalHome />
}

export default AppHome