import { useState, useEffect } from 'react'
import { Search, Grid, Map as MapIcon, ArrowRight } from 'lucide-react'
import { getPublicPlaces } from '../services/dataService'
import PlaceCard from '../components/common/PlaceCard'
import EmptyState from '../components/common/EmptyState'
import { PLACE_CATEGORY_OPTIONS } from '../constants/placeCategories'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet marker icon asset paths
const defaultMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const CATEGORIES = ['All', ...PLACE_CATEGORY_OPTIONS]

function Explore({ onOpenPlace }) {
  const [places, setPlaces] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'map'

  const loadPlaces = () => {
    setPlaces(getPublicPlaces())
  }

  useEffect(() => {
    loadPlaces()
    window.addEventListener('placepulse_data_changed', loadPlaces)
    return () => window.removeEventListener('placepulse_data_changed', loadPlaces)
  }, [])

  const filteredPlaces = places.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  // Map center: average of places with valid coords or default Karnataka coastal center (13.5, 75.2)
  const validPlacesWithCoords = filteredPlaces.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number' && !isNaN(p.latitude)
  )

  const defaultCenter =
    validPlacesWithCoords.length > 0
      ? [validPlacesWithCoords[0].latitude, validPlacesWithCoords[0].longitude]
      : [13.3409, 74.7421]

  return (
    <div>
      <div className="page-header">
        <h1>Explore & Discover</h1>
        <p>Find real-world places, attractions, and local travel secrets.</p>
      </div>

      {/* Search Bar & View Mode Toggle */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by place name, city, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-background)',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-hover)', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            className={`btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
            style={{ gap: '4px', padding: '8px 12px' }}
          >
            <Grid size={16} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            className={`btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('map')}
            title="Interactive Map"
            style={{ gap: '4px', padding: '8px 12px' }}
          >
            <MapIcon size={16} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content: Map View or Grid View */}
      {viewMode === 'map' ? (
        <div style={{ marginTop: '10px' }}>
          <div className="map-container">
            <MapContainer
              center={defaultCenter}
              zoom={7}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validPlacesWithCoords.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={defaultMarkerIcon}
                >
                  <Popup>
                    <div style={{ width: '180px' }}>
                      {place.coverImage && (
                        <img
                          src={place.coverImage}
                          alt={place.name}
                          style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }}
                        />
                      )}
                      <strong style={{ fontSize: '14px', display: 'block', color: '#111' }}>{place.name}</strong>
                      <span style={{ fontSize: '11px', color: '#666' }}>{place.location}</span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '4px 8px' }}
                        onClick={() => onOpenPlace?.(place)}
                      >
                        View Place
                        <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
            Showing {validPlacesWithCoords.length} places with coordinates on Leaflet OpenStreetMap.
          </p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <EmptyState
          title="No places match your search"
          message="Try adjusting your keywords or category filter to discover more places."
        />
      ) : (
        <div className="places-grid" style={{ marginTop: '12px' }}>
          {filteredPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onOpen={onOpenPlace}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Explore
