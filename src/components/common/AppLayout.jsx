import Navbar from './Navbar'
import BottomNav from './BottomNav'

function AppLayout({ children, currentPage, setCurrentPage }) {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-content">
        {children}
      </main>

      <BottomNav
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  )
}

export default AppLayout