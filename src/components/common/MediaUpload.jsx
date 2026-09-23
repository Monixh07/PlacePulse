import { useState } from 'react'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1280
const IMAGE_QUALITY = 0.8

function isVideoSource(value) {
  return value?.startsWith('data:video/') || /\.(mp4|mov|webm|ogg)(\?|$)/i.test(value || '')
}

function readFileAsDataUrl(file, onLoad, onError) {
  const reader = new FileReader()
  reader.onload = () => onLoad(reader.result)
  reader.onerror = onError
  reader.readAsDataURL(file)
}

function compressImage(file, onLoad, onError) {
  const image = new Image()
  image.onload = () => {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext('2d')
    if (!context) {
      onError()
      return
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    onLoad(canvas.toDataURL('image/jpeg', IMAGE_QUALITY))
  }
  image.onerror = onError
  readFileAsDataUrl(file, (dataUrl) => { image.src = dataUrl }, onError)
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
    const handleLoad = (dataUrl) => onChange(dataUrl, file)
    const handleError = () => setError('This file could not be read. Please try another one.')
    if (file.type.startsWith('image/')) {
      compressImage(file, handleLoad, handleError)
    } else {
      readFileAsDataUrl(file, handleLoad, handleError)
    }
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
