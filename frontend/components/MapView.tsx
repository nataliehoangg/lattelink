'use client'

import { Cafe } from '@/lib/api'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapPin, Star, Zap, Users } from 'lucide-react'

interface MapViewProps {
  cafes: Cafe[]
  currentQuery?: string
}

declare global {
  interface Window {
    __lattelinkMapsLoading?: boolean
    __lattelinkMapReady?: boolean
  }
}

export default function MapView({ cafes, currentQuery }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const markerMapRef = useRef<Record<string, google.maps.Marker>>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const pendingPanRef = useRef(false)
  const activeCafeIdRef = useRef<string | null>(null)
  const markerLabelMapRef = useRef<Record<string, string>>({})
  const mapZoomRef = useRef<number>(13)
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null)
  const [activeCafeId, setActiveCafeId] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  const sortedCafes = useMemo(
    () => cafes.slice().sort((a, b) => b.workabilityScore - a.workabilityScore),
    [cafes]
  )
  const rankMap = useMemo(() => {
    const map: Record<string, number> = {}
    sortedCafes.forEach((cafe, index) => {
      map[cafe._id] = index + 1
    })
    return map
  }, [sortedCafes])

  const escapeHtml = useCallback((value: string) => {
    const safeValue = String(value)
    return safeValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }, [])

  const createInfoWindowContent = useCallback(
    (cafe: Cafe) => {
      const name = escapeHtml(cafe.name ?? '')
      const location = escapeHtml(cafe.neighborhood || cafe.city || '')
      const score = cafe.workabilityScore.toFixed(1)
      const wifi = cafe.amenities?.wifi?.quality ?? 'unknown'
      const seating = cafe.amenities?.seating?.type ?? 'unknown'

      return `
        <div style="max-width:240px;padding:12px 14px;font-family:'Inter',sans-serif;color:#2D241F;">
          <h3 style="margin:0 0 6px;font-size:16px;font-weight:600;letter-spacing:0.01em;">${name}</h3>
          <p style="margin:0 0 10px;font-size:12px;color:#5C4431;">${location}</p>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#2D241F;">
            <span style="display:flex;align-items:center;gap:6px;font-weight:600;">
              ⭐ ${score}/10
            </span>
            <span style="display:flex;align-items:center;gap:6px;">
              📶 Wi-Fi: ${escapeHtml(wifi)}
            </span>
            <span style="display:flex;align-items:center;gap:6px;">
              🪑 Seating: ${escapeHtml(seating)}
            </span>
          </div>
        </div>
      `
    },
    [escapeHtml]
  )

  const openInfoWindow = useCallback(
    (cafe: Cafe, marker: google.maps.Marker) => {
      if (!window.google?.maps || !mapInstanceRef.current) return

      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow()
      }

      infoWindowRef.current.setContent(createInfoWindowContent(cafe))
      infoWindowRef.current.open({
        map: mapInstanceRef.current,
        anchor: marker,
      })
    },
    [createInfoWindowContent]
  )

  const computeScale = useCallback((zoom: number, isActive: boolean) => {
    const normalizedZoom = Number.isFinite(zoom) ? zoom : 13
    const base = 6 + Math.max(0, Math.min(normalizedZoom - 12, 6)) * 0.9
    return isActive ? base + 3 : base
  }, [])

  const setMarkerAppearance = useCallback(
    (id: string, marker: google.maps.Marker, isActive: boolean) => {
      if (!window.google?.maps) return

      const zoom = mapZoomRef.current ?? mapInstanceRef.current?.getZoom() ?? 13
      const icon: google.maps.Symbol = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: computeScale(zoom, isActive),
        fillColor: isActive ? '#2D241F' : '#5C4431',
        fillOpacity: 1,
        strokeColor: isActive ? '#EBDCCB' : '#F8F5F1',
        strokeWeight: isActive ? 3 : 2,
        labelOrigin: new window.google.maps.Point(0, 0),
      }

      marker.setIcon(icon)
      marker.setZIndex(isActive ? (window.google.maps.Marker.MAX_ZINDEX || 10000) + 1 : 1)

      const labelText = markerLabelMapRef.current[id]
      if (labelText) {
        marker.setLabel({
          text: labelText,
          color: isActive ? '#F8F5F1' : '#2D241F',
          fontSize: isActive ? '14px' : '12px',
          fontWeight: isActive ? '700' : '600',
        })
      }
    },
    [computeScale]
  )

  const showCafeOnMap = useCallback(
    (cafe: Cafe, options: { pan?: boolean } = {}) => {
      pendingPanRef.current = !!options.pan
      activeCafeIdRef.current = cafe._id
      setActiveCafeId(cafe._id)

      const marker = markerMapRef.current[cafe._id]
      if (marker) {
        openInfoWindow(cafe, marker)
      }
    },
    [openInfoWindow]
  )

  useEffect(() => {
    if (!mapRef.current || cafes.length === 0) {
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      markerMapRef.current = {}
      markerLabelMapRef.current = {}
      infoWindowRef.current?.close()
      setActiveCafeId(null)
      activeCafeIdRef.current = null
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove()
        zoomListenerRef.current = null
      }
      return
    }

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
        const center = sortedCafes[0]?.coordinates || { lat: 37.8715, lng: -122.273 }
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

      mapZoomRef.current = map.getZoom() ?? mapZoomRef.current
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove()
      }
      zoomListenerRef.current = map.addListener('zoom_changed', () => {
        mapZoomRef.current = map.getZoom() ?? mapZoomRef.current
        Object.entries(markerMapRef.current).forEach(([id, marker]) => {
          const isActive = activeCafeIdRef.current === id
          setMarkerAppearance(id, marker, isActive)
        })
      })

      // Clear old markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []
      markerMapRef.current = {}
      markerLabelMapRef.current = {}

      markersRef.current = sortedCafes.map((cafe) => {
        const rank = rankMap[cafe._id] ?? 0
        const rankText = rank ? String(rank) : ''

        const marker = new window.google.maps.Marker({
          position: { lat: cafe.coordinates.lat, lng: cafe.coordinates.lng },
          map,
          title: cafe.name,
          label: rankText
            ? {
                text: rankText,
                color: '#2D241F',
                fontSize: '12px',
                fontWeight: '600',
              }
            : undefined,
        })

        markerLabelMapRef.current[cafe._id] = rankText
        markerMapRef.current[cafe._id] = marker
        marker.addListener('mouseover', () => showCafeOnMap(cafe))
        marker.addListener('click', () => showCafeOnMap(cafe, { pan: true }))

        setMarkerAppearance(cafe._id, marker, activeCafeIdRef.current === cafe._id)

        return marker
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
      markerMapRef.current = {}
      markerLabelMapRef.current = {}
      infoWindowRef.current?.close()
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove()
        zoomListenerRef.current = null
      }
    }
  }, [cafes, rankMap, setMarkerAppearance, showCafeOnMap, sortedCafes])

  useEffect(() => {
    if (!window.google?.maps) return

    activeCafeIdRef.current = activeCafeId

    Object.entries(markerMapRef.current).forEach(([id, marker]) => {
      setMarkerAppearance(id, marker, id === activeCafeId)
    })

    if (!activeCafeId) {
      infoWindowRef.current?.close()
      return
    }

    const cafe = cafes.find((item) => item._id === activeCafeId)
    const marker = markerMapRef.current[activeCafeId]

    if (!cafe || !marker) return

    openInfoWindow(cafe, marker)

    if (pendingPanRef.current && mapInstanceRef.current && marker.getPosition()) {
      const position = marker.getPosition()
      if (position) {
        mapInstanceRef.current.panTo(position)
        mapInstanceRef.current.panBy(0, -80)
      }
    }
    pendingPanRef.current = false
  }, [activeCafeId, cafes, openInfoWindow, setMarkerAppearance])

  if (cafes.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="editorial-body text-deep-coffee/70">
          No cafés found to display on map.
        </p>
      </div>
    )
  }

  const trimmedQuery = currentQuery?.trim()

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
            {sortedCafes.map((cafe, index) => {
              const isActive = activeCafeId === cafe._id
              return (
                <li key={cafe._id}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onMouseEnter={() => showCafeOnMap(cafe)}
                    onFocus={() => showCafeOnMap(cafe)}
                    onClick={() => showCafeOnMap(cafe, { pan: true })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        showCafeOnMap(cafe, { pan: true })
                      }
                    }}
                    className={`group border bg-pale-latte/30 p-4 transition duration-300 cursor-pointer outline-none ${
                      isActive
                        ? 'border-espresso shadow-lg bg-pale-latte/60'
                        : 'border-mist-gray/60 hover:border-espresso hover:bg-pale-latte/45 focus:border-espresso focus:bg-pale-latte/45'
                    }`}
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
                          {`${cafe.workabilityScore.toFixed(1)}/10`}
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
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={
                          trimmedQuery
                            ? { pathname: `/cafe/${cafe._id}`, query: { q: trimmedQuery } }
                            : `/cafe/${cafe._id}`
                        }
                        className="editorial-caption text-espresso transition-colors hover:text-deep-coffee"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </li>
              )
            })}
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

