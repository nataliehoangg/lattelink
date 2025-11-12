'use client'

import { Cafe } from '@/lib/api'
import { useEffect, useRef } from 'react'

interface MapViewProps {
  cafes: Cafe[]
}

export default function MapView({ cafes }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current || cafes.length === 0) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return // Will show the note below
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Initialize Google Maps
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google && window.google.maps) {
        initializeMap()
      }
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps')
    }

    document.head.appendChild(script)

    function initializeMap() {
      if (!mapRef.current || !window.google) return

      const center = cafes[0]?.coordinates || { lat: 37.8715, lng: -122.2730 }
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: center.lat, lng: center.lng },
        zoom: 13,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#F8F5F1' }], // cream
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#E2DED9' }], // mist-gray
          },
        ],
      })

      cafes.forEach((cafe) => {
        new window.google.maps.Marker({
          position: { lat: cafe.coordinates.lat, lng: cafe.coordinates.lng },
          map,
          title: cafe.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#5C4431', // espresso
            fillOpacity: 1,
            strokeColor: '#F8F5F1', // cream
            strokeWeight: 2,
          },
        })
      })
    }

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
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

  return (
    <div>
      <div className="mb-12">
        <h2 className="editorial-h2 text-deep-coffee mb-2">
          Map View
        </h2>
        <p className="editorial-caption text-deep-coffee/60">
          {cafes.length} {cafes.length === 1 ? 'café' : 'cafés'} on map
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[600px] border border-mist-gray bg-mist-gray"
        style={{ minHeight: '600px' }}
      />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="mt-6 p-6 bg-pale-latte/30 border border-mist-gray editorial-body text-deep-coffee/70">
          <strong>Note:</strong> Add your Google Maps API key to <code className="bg-mist-gray px-2 py-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code className="bg-mist-gray px-2 py-1">.env.local</code> to enable map view.
        </div>
      )}
    </div>
  )
}

