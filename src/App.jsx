import { useState } from 'react'
import Button from './components/common/Button'
import Input from './components/common/Input'
import Card from './components/common/Card'
import Loading from './components/common/Loading'
import Modal from './components/common/Modal'
import EmptyState from './components/common/EmptyState'
import StatusBadge from './components/common/StatusBadge'
import Navbar from './components/common/Navbar'
import BottomNav from './components/common/BottomNav'

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Navbar />

      <main className="app-test">
        <h1>PlacePulse</h1>
        <p>Discover Places. Create. Promote.</p>

        <Card>
          <Input
            label="Name"
            placeholder="Enter your name"
          />

          <br />

          <Button onClick={() => setShowModal(true)}>
            Open Modal
          </Button>

          <br />

          <StatusBadge status="Available" />
        </Card>

        <EmptyState
          title="No places yet"
          message="Places you discover will appear here."
        />

        <Loading />
      </main>

      {showModal && (
        <Modal
          title="PlacePulse"
          onClose={() => setShowModal(false)}
        >
          <p>This is a reusable modal component.</p>

          <br />

          <Button onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal>
      )}

      <BottomNav />
    </>
  )
}

export default App