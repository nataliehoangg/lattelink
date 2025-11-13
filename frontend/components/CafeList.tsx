'use client'

import { Cafe } from '@/lib/api'
import CafeCard from './CafeCard'

interface CafeListProps {
  cafes: Cafe[]
  currentQuery?: string
}

export default function CafeList({ cafes, currentQuery }: CafeListProps) {
  if (cafes.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="editorial-body text-deep-coffee/70">
          No cafés found. Try searching for a different city or neighborhood.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <div className="flex items-end gap-6 border-b border-mist-gray pb-6">
          <h2 className="editorial-h2 text-deep-coffee">
            {cafes.length} {cafes.length === 1 ? 'Café' : 'Cafés'}
          </h2>
          <p className="editorial-caption text-deep-coffee/60">
            Sorted by workability score
          </p>
        </div>
      </div>
      {/* Grid with generous spacing - editorial layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cafes.map((cafe, index) => (
          <CafeCard key={cafe._id} cafe={cafe} index={index} currentQuery={currentQuery} />
        ))}
      </div>
    </div>
  )
}
