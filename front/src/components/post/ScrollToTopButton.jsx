'use client'

import { useState, useEffect } from 'react'
import { FiArrowUp } from 'react-icons/fi'

export default function ScrollToTopButton({ onReset }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onReset?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Retour en haut"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-[var(--color-text-title)] p-3 text-white shadow-lg transition-opacity hover:opacity-80"
    >
      <FiArrowUp size={20} />
    </button>
  )
}
