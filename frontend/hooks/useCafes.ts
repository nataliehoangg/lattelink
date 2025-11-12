import useSWR from 'swr'
import { cafesApi, CafeSearchParams } from '@/lib/api'

export function useCafes(searchQuery: string = '') {
  const params: CafeSearchParams = {
    sort: 'workabilityScore', // Always sort by workability by default
    limit: 1000, // Get all cafes (or a large number)
  }
  
  if (searchQuery) {
    // Try to detect if it's a city or general search
    if (searchQuery.includes(',')) {
      const parts = searchQuery.split(',').map(s => s.trim())
      params.city = parts[0]
      if (parts[1]) params.neighborhood = parts[1]
    } else {
      params.q = searchQuery
    }
  }

  // Only fetch when there's a search query
  const {
    data,
    error,
    isLoading: swrIsLoading,
    isValidating,
  } = useSWR(
    searchQuery ? ['cafes', params, searchQuery] : null,
    () => cafesApi.search(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const isLoading =
    !!searchQuery && (swrIsLoading || (!data && !error) || isValidating)

  return {
    cafes: data,
    isLoading,
    error: error ? new Error(error.message || 'Failed to fetch cafes') : null,
  }
}

