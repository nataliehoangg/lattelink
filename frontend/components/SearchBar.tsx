'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search cafés by city, vibe, or name"
          className="w-full bg-transparent border-0 border-b-2 border-mist-gray pb-3 pt-2 px-0 text-deep-coffee placeholder:text-deep-coffee/40 focus:outline-none editorial-body text-center tracking-wide"
          style={{
            fontVariant: 'small-caps',
            letterSpacing: '0.05em',
          }}
        />
        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-espresso"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused || query ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ transformOrigin: 'center' }}
        />
      </div>
    </motion.form>
  )
}
