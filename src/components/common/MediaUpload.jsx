import { useState } from 'react'

const MAX_FILE_SIZE = 2 * 1024 * 1024

function isVideoSource(value) {
  return value?.startsWith('data:video/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(value || '')
}

/** Device file picker that stores a persistent data URL in browser storage. */
function MediaUpload({ value, onChange, accept = 'image/*,video/*', label = 'Tap to upload a photo or video' }) {
  const [error, setError] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setError('Choose a file smaller than 2 MB so it can be saved in this browser.')
      event.target.value = ''
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result, file)
    reader.onerror = () => setError('This file could not be read. Please try another one.')
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="file-upload-area">
        <input type="file" accept={accept} onChange={handleFileChange} />
        <div className="file-upload-icon">📁</div>
        <div className="file-upload-label"><strong>Tap to choose file</strong><br />{label} (max 2 MB)</div>
      </div>
      {error && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
      {value && <div className="media-preview">{isVideoSource(value) ? <video src={value} controls muted playsInline /> : <img src={value} alt="Selected upload preview" />}</div>}
    </div>
  )
}

export default MediaUpload
