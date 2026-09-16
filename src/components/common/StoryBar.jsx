import { Plus } from 'lucide-react'

function StoryBar({ places = [], onSelectPlace }) {
  return (
    <section className="story-bar">
      <h2>Explore Places & Stories</h2>

      <div className="story-list">
        <div className="story-item" title="Add Story">
          <div className="story-circle">
            <div className="story-circle-inner">
              <Plus size={22} />
            </div>
          </div>
          <span>Your Story</span>
        </div>

        {places.slice(0, 8).map((place) => (
          <div
            key={place.id}
            className="story-item"
            onClick={() => onSelectPlace?.(place)}
            title={place.name}
          >
            <div className="story-circle">
              <div className="story-circle-inner">
                {place.coverImage ? (
                  <img src={place.coverImage} alt={place.name} />
                ) : (
                  <span>{place.name.charAt(0)}</span>
                )}
              </div>
            </div>
            <span>{place.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StoryBar