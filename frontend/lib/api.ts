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
    noise: {
      level: 'quiet' | 'moderate' | 'loud' | 'unknown'
      score: number
    }
  }
  workabilityScore: number
  tags: string[]
  reviews?: any[]
  phone?: string
  website?: string
  hours?: Record<string, string>
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

