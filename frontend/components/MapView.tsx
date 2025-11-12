'use client'

import { Cafe } from '@/lib/api'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Star, Zap, Users } from 'lucide-react'

interface MapViewProps {
  cafes: Cafe[]
}

declare global {
  interface Window {
    __lattelinkMapsLoading?: boolean
    __lattelinkMapReady?: boolean
  }
}

export default function MapView({ cafes }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || cafes.length === 0) return

    setMapError(null)

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setMapError(
        'Add your Google Maps API key to NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to enable the map.'
      )
      return
    }

    const initializeMap = () => {
      if (!mapRef.current || !window.google?.maps) {
        setMapError(
          'Google Maps is unavailable right now. Check the API key configuration or console for details.'
        )
        return
      }

      if (!mapInstanceRef.current) {
        const center = cafes[0]?.coordinates || { lat: 37.8715, lng: -122.273 }
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 13,
          styles: [
            {
              featureType: 'all',
              elementType: 'geometry',
              stylers: [{ color: '#F8F5F1' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#E2DED9' }],
            },
          ],
        })
      }

      const map = mapInstanceRef.current
      if (!map) return

      // Clear old markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      markersRef.current = cafes.map((cafe) => {
        return new window.google.maps.Marker({
          position: { lat: cafe.coordinates.lat, lng: cafe.coordinates.lng },
          map,
          title: cafe.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#5C4431',
            fillOpacity: 1,
            strokeColor: '#F8F5F1',
            strokeWeight: 2,
          },
        })
      })
    }

    if (window.google?.maps) {
      initializeMap()
      return
    }

    if (window.__lattelinkMapsLoading) {
      const interval = window.setInterval(() => {
        if (window.google?.maps) {
          window.clearInterval(interval)
          initializeMap()
        }
      }, 200)
      return () => window.clearInterval(interval)
    }

    window.__lattelinkMapsLoading = true
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      window.__lattelinkMapsLoading = false
      window.__lattelinkMapReady = true
      initializeMap()
    }
    script.onerror = () => {
      window.__lattelinkMapsLoading = false
      console.error('Failed to load Google Maps')
      setMapError(
        'Google Maps failed to load. Confirm that billing is enabled and that the key allows Maps JavaScript API for this origin.'
      )
    }

    document.head.appendChild(script)

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null))
    }
  }, [cafes])

  if (cafes.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="editorial-body text-deep-coffee/70">
          No cafés found to display on map.
        </p>
      </div>
    )
  }

  const sortedCafes = useMemo(() => cafes.slice().sort((a, b) => b.workabilityScore - a.workabilityScore), [cafes])

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-1">
        <h2 className="editorial-h2 text-deep-coffee">Map View</h2>
        <p className="editorial-caption text-deep-coffee/60">
          {cafes.length} {cafes.length === 1 ? 'café' : 'cafés'} in this search
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
        <aside className="max-h-[620px] overflow-y-auto border border-mist-gray bg-cream/85 p-6 backdrop-blur-sm shadow-sm">
          <h3 className="editorial-caption text-deep-coffee/60 tracking-[0.3em] mb-4">
            RANKED CAFÉS
          </h3>
          <ol className="space-y-4">
            {sortedCafes.map((cafe, index) => (
              <li
                key={cafe._id}
                className="border border-mist-gray/60 bg-pale-latte/30 p-4 transition-colors duration-300 hover:border-espresso"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="editorial-caption text-deep-coffee/50">#{index + 1}</p>
                    <p className="editorial-body text-deep-coffee">{cafe.name}</p>
                    <div className="flex items-center gap-2 text-deep-coffee/60 editorial-caption">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{cafe.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-cream/70 px-3 py-1">
                    <Star className="h-4 w-4 text-mocha fill-mocha" />
                    <span className="editorial-caption text-espresso">
                      {cafe.workabilityScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-deep-coffee/70 editorial-caption">
                  <span className="inline-flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {cafe.amenities.outlets.available ? 'Outlets ready' : 'Limited outlets'}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {cafe.amenities.seating.type}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <div className="relative">
          <div
            ref={mapRef}
            className="h-[620px] w-full border border-mist-gray bg-mist-gray"
            style={{ minHeight: '620px' }}
          />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream/85 px-6 text-center">
              <p className="editorial-body text-deep-coffee/80">
                {mapError}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

