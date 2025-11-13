'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { cafesApi, Cafe } from '@/lib/api'
import { Wifi, Zap, Users, Volume2, MapPin, Star, Globe, Phone } from 'lucide-react'
import Link from 'next/link'

export default function CafeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const previousQuery = searchParams?.get('q') ?? ''
  const fallbackHref = previousQuery ? `/?q=${encodeURIComponent(previousQuery)}` : '/'
  const id = params.id as string

  const { data: cafe, error, isLoading } = useSWR(
    id ? ['cafe', id] : null,
    () => cafesApi.getById(id)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-mist-gray border-t-espresso"></div>
      </div>
    )
  }

  if (error || !cafe) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="editorial-h2 text-deep-coffee mb-4">Café not found</h1>
          <Link href={fallbackHref} className="editorial-body text-mocha hover:text-espresso transition-colors">
            ← Back to search
          </Link>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-16">
      <main className="editorial-container">
        <div className="mb-10">
          <button
            type="button"
            onClick={handleBack}
            className="editorial-caption text-mocha hover:text-espresso transition-colors inline-flex items-center gap-2"
          >
            ← Back
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-cream border border-mist-gray p-12"
        >
          <div className="flex justify-between items-start mb-12">
            <div className="flex-1">
              <h1 className="editorial-h1 text-espresso mb-4">
                {cafe.name}
              </h1>
              <div className="flex items-center editorial-body text-deep-coffee/70 mb-6">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{cafe.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-pale-latte/50 px-6 py-3">
              <Star className="w-6 h-6 fill-mocha text-mocha" />
              <span className="editorial-h2 text-espresso">
                {`${cafe.workabilityScore.toFixed(1)}/10`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-pale-latte/30 p-6 border border-mist-gray">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="w-5 h-5 text-espresso" />
                <span className="editorial-caption text-deep-coffee">Wi-Fi</span>
              </div>
              <div className="editorial-body text-deep-coffee capitalize mb-1">
                {cafe.amenities.wifi.quality}
              </div>
              <div className="editorial-caption text-deep-coffee/50">
                {cafe.amenities.wifi.score.toFixed(1)}/10
              </div>
            </div>

            <div className="bg-pale-latte/30 p-6 border border-mist-gray">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-mocha" />
                <span className="editorial-caption text-deep-coffee">Outlets</span>
              </div>
              <div className="editorial-body text-deep-coffee">
                {cafe.amenities.outlets.available ? 'Available' : 'Limited'}
              </div>
              <div className="editorial-caption text-deep-coffee/50">
                {cafe.amenities.outlets.score.toFixed(1)}/10
              </div>
            </div>

            <div className="bg-pale-latte/30 p-6 border border-mist-gray">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-espresso" />
                <span className="editorial-caption text-deep-coffee">Seating</span>
              </div>
              <div className="editorial-body text-deep-coffee capitalize">
                {cafe.amenities.seating.type}
              </div>
              <div className="editorial-caption text-deep-coffee/50">
                {cafe.amenities.seating.score.toFixed(1)}/10
              </div>
            </div>

            <div className="bg-pale-latte/30 p-6 border border-mist-gray">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-5 h-5 text-espresso" />
                <span className="editorial-caption text-deep-coffee">Noise</span>
              </div>
              <div className="editorial-body text-deep-coffee capitalize">
                {cafe.amenities.noise.level}
              </div>
              <div className="editorial-caption text-deep-coffee/50">
                {cafe.amenities.noise.score.toFixed(1)}/10
              </div>
            </div>
          </div>

          {cafe.tags && cafe.tags.length > 0 && (
            <div className="mb-12">
              <h2 className="editorial-h2 text-deep-coffee mb-6">Tags</h2>
              <div className="flex flex-wrap gap-3">
                {cafe.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="editorial-caption px-4 py-2 bg-mist-gray/50 text-deep-coffee"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {cafe.phone && (
              <div className="flex items-center gap-3 editorial-body text-deep-coffee">
                <Phone className="w-5 h-5 text-mocha" />
                <span>{cafe.phone}</span>
              </div>
            )}
            {cafe.website && (
              <a
                href={cafe.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 editorial-body text-mocha hover:text-espresso transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>Website</span>
              </a>
            )}
          </div>

          {cafe.reviews && cafe.reviews.length > 0 && (
            <div>
              <h2 className="editorial-h2 text-deep-coffee mb-8">
                Recent Reviews
              </h2>
              <div className="space-y-6">
                {cafe.reviews.slice(0, 5).map((review: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-pale-latte/20 p-6 border border-mist-gray"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {review.rating && (
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-mocha text-mocha'
                                  : 'text-mist-gray'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <span className="editorial-caption text-deep-coffee/60">
                        {review.author || 'Anonymous'}
                      </span>
                    </div>
                    <p className="editorial-body text-deep-coffee">{review.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
