import React, { useState } from 'react'
import './BlockWebsite.css'

const BlockWebsite = () => {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would handle the URL blocking logic
    console.log('URL to block:', url)
    setUrl('')
  }

  return (
    <div className="block-website-container">
      <div className="floating-element heart">❤️</div>
      <div className="floating-element star">⭐</div>
      <div className="floating-element cloud">☁️</div>
      <h2>Block Website</h2>
      <form onSubmit={handleSubmit} className="block-website-form">
        <div className="input-container">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <label className="input-label">Enter URL to block</label>
        </div>
        <button type="submit" className="block-button">Block</button>
      </form>
    </div>
  )
}

export default BlockWebsite