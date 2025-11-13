'use client'

import { Cafe } from '@/lib/api'
import { Wifi, Zap, Users, Volume2, MapPin, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CafeCardProps {
  cafe: Cafe
  index?: number
  currentQuery?: string
}

export default function CafeCard({ cafe, index = 0, currentQuery }: CafeCardProps) {
  const getWifiIcon = () => {
    switch (cafe.amenities.wifi.quality) {
      case 'excellent':
        return '📶'
      case 'good':
        return '📶'
      case 'spotty':
        return '📡'
      default:
        return '❓'
    }
  }

  const getNoiseIcon = () => {
    switch (cafe.amenities.noise.level) {
      case 'quiet':
        return '🔇'
      case 'moderate':
        return '🔉'
      case 'loud':
        return '🔊'
      default:
        return '❓'
    }
  }

  const trimmedQuery = currentQuery?.trim()
  const cafeLink = trimmedQuery
    ? {
        pathname: `/cafe/${cafe._id}`,
        query: { q: trimmedQuery },
      }
    : `/cafe/${cafe._id}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative"
    >
      <Link href={cafeLink}>
        <div className="relative bg-cream border border-mist-gray overflow-hidden hover-lift h-full">
          {/* Optional: Image background placeholder - can be replaced with actual images */}
          <div className="absolute inset-0 bg-gradient-to-br from-pale-latte/30 to-mist-gray/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
          
          <div className="relative p-8 flex flex-col h-full">
            {/* Header with name and score */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h3 className="editorial-h2 text-deep-coffee mb-2">
                  {cafe.name}
                </h3>
                <div className="flex items-center editorial-caption text-mocha mb-4">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  <span>{cafe.neighborhood || cafe.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-pale-latte/50 px-3 py-1.5 rounded">
                <Star className="w-4 h-4 fill-mocha text-mocha" />
                <span className="font-semibold text-espresso text-sm">
                  {`${cafe.workabilityScore.toFixed(1)}/10`}
                </span>
              </div>
            </div>

            {/* Amenities - minimal icons only */}
            <div className="flex items-center gap-6 mb-6 editorial-caption text-deep-coffee/60">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{getWifiIcon()}</span>
                <span className="capitalize">{cafe.amenities.wifi.quality}</span>
              </div>
              {cafe.amenities.outlets.available && (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-mocha" />
                  <span>Outlets</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-base">{getNoiseIcon()}</span>
                <span className="capitalize">{cafe.amenities.noise.level}</span>
              </div>
            </div>

            {/* Tags */}
            {cafe.tags && cafe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {cafe.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="editorial-caption px-3 py-1 bg-mist-gray/50 text-deep-coffee/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hover overlay - reveals on hover */}
            <div className="absolute inset-0 bg-deep-coffee/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
