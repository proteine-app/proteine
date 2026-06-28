/**
 * API Service - Integrates with Open Food Facts API
 * Provides food search functionality with caching and retry logic
 */

const API_BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const API_TIMEOUT = 10000
const MAX_RETRIES = 3
const RETRY_DELAYS = [3000, 6000, 12000] // 3s, 6s, 12s in milliseconds

/**
 * Fetch with exponential backoff retry logic
 * @param {string} url - the URL to fetch
 * @param {Object} options - fetch options
 * @returns {Promise<Response>} the fetch response
 * @throws {Error} if all retries fail
 */
async function fetchWithRetry(url, options = {}) {
  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      return response
    } catch (error) {
      lastError = error

      // If this wasn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES) {
        const delayMs = RETRY_DELAYS[attempt]
        console.warn(
          `Fetch attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delayMs}ms...`
        )
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  // All retries exhausted
  throw lastError
}

/**
 * Search for food items by name using Open Food Facts API
 * @param {string} name - the food name to search for
 * @param {Object} cacheService - the cache service instance with getCachedFood and setCachedFood methods
 * @returns {Promise<Array<{name, proteinPer100g}>>} array of food items with protein content
 */
export async function searchFood(name, cacheService) {
  try {
    const params = new URLSearchParams({
      search_terms: name,
      json: 1,
      action: 'process',
    })

    const response = await fetchWithRetry(`${API_BASE_URL}?${params}`)

    if (!response.ok) {
      console.error('API response not ok:', response.status)
      return []
    }

    const data = await response.json()
    const products = data.products || []

    // Filter products that have protein data and cache them
    const results = []
    for (const product of products) {
      if (product.proteins_100g !== undefined && product.proteins_100g !== null) {
        const name = product.product_name
        const proteinPer100g = product.proteins_100g

        // Cache the result
        cacheService.setCachedFood(name, { proteinPer100g })

        results.push({
          name,
          proteinPer100g,
        })
      }
    }

    return results
  } catch (error) {
    console.error('Error searching food:', error)
    return []
  }
}

/**
 * Get a cached food item by name
 * @param {string} name - the food name to look up
 * @param {Object} cacheService - the cache service instance
 * @returns {{proteinPer100g, cached: boolean} | null} cached food with flag, or null if not found
 */
export function getFoodFromCache(name, cacheService) {
  const cached = cacheService.getCachedFood(name)
  if (cached === null) {
    return null
  }

  return {
    proteinPer100g: cached.proteinPer100g,
    cached: true,
  }
}
