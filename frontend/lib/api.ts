import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Cafe {
  _id: string
  name: string
  address: string
  city: string
  neighborhood?: string
  coordinates: {
    lat: number
    lng: number
  }
  amenities: {
    wifi: {
      quality: 'excellent' | 'good' | 'spotty' | 'poor' | 'unknown'
      score: number
    }
    outlets: {
      available: boolean
      score: number
      notes?: string
    }
    seating: {
      type: 'comfortable' | 'adequate' | 'limited' | 'unknown'
      score: number
    }
    capacity?: {
      level: 'ample' | 'roomy' | 'cozy' | 'tight' | 'unknown'
      score: number
    }
    drinks?: {
      quality: 'excellent' | 'good' | 'average' | 'poor' | 'unknown'
      score: number
    }
    lighting?: {
      quality: 'bright' | 'balanced' | 'dim' | 'unknown'
      score: number
    }
    noise: {
      level: 'quiet' | 'moderate' | 'loud' | 'unknown'
      score: number
    }
  }
  workabilityScore: number
  metrics?: CafeMetrics
  tags: string[]
  reviews?: any[]
  phone?: string
  website?: string
  hours?: Record<string, string>
}

export interface CafeMetrics {
  functional?: {
    score?: number
    components?: {
      wifi?: number
      seating?: number
      outlets?: number
      capacity?: number
      drinks?: number
    }
  }
  atmospheric?: {
    score?: number
    components?: {
      reputation?: number
      noise?: number
      lighting?: number
    }
  }
  confidence?: {
    reviewsAnalyzed?: number
    smoothingConstant?: number
    globalMean?: number
    rawScore?: number
    factorMentions?: Record<string, number>
  }
}

export interface CafeSearchParams {
  city?: string
  neighborhood?: string
  q?: string
  wifi?: string
  outlets?: boolean
  noise?: string
  lat?: number
  lng?: number
  radius?: number
  limit?: number
  sort?: string
}

export const cafesApi = {
  search: async (params: CafeSearchParams = {}) => {
    const response = await api.get('/cafes', { params })
    return response.data.data as Cafe[]
  },
  getById: async (id: string) => {
    const response = await api.get(`/cafes/${id}`)
    return response.data.data as Cafe
  },
}

export const reviewsApi = {
  create: async (data: {
    cafe: string
    text: string
    rating?: number
    author?: string
  }) => {
    const response = await api.post('/reviews', data)
    return response.data.data
  },
}

export default api

