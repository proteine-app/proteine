import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { searchFood, getFoodFromCache } from '../../src/services/api.js'

describe('API Service', () => {
  let mockCacheService

  beforeEach(() => {
    // Mock the cache service
    mockCacheService = {
      getCachedFood: vi.fn(),
      setCachedFood: vi.fn(),
    }
    // Clear all mocks
    vi.clearAllMocks()
    // Mock timers for retry logic
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  describe('searchFood', () => {
    it('should successfully fetch and return food items with proteins', async () => {
      // Mock successful fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              product_name: 'Chicken Breast',
              proteins_100g: 26,
            },
            {
              product_name: 'Rice',
              proteins_100g: 2.7,
            },
          ],
        }),
      })

      const result = await searchFood('chicken', mockCacheService)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        name: 'Chicken Breast',
        proteinPer100g: 26,
      })
      expect(result[1]).toEqual({
        name: 'Rice',
        proteinPer100g: 2.7,
      })
    })

    it('should filter out products without proteins_100g', async () => {
      // Mock fetch with mixed products
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              product_name: 'Chicken Breast',
              proteins_100g: 26,
            },
            {
              product_name: 'Unknown Product',
              // Missing proteins_100g
            },
            {
              product_name: 'Egg',
              proteins_100g: 13,
            },
          ],
        }),
      })

      const result = await searchFood('food', mockCacheService)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Chicken Breast')
      expect(result[1].name).toBe('Egg')
    })

    it('should call setCachedFood for each successful result', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              product_name: 'Chicken',
              proteins_100g: 26,
            },
            {
              product_name: 'Egg',
              proteins_100g: 13,
            },
          ],
        }),
      })

      await searchFood('chicken', mockCacheService)

      expect(mockCacheService.setCachedFood).toHaveBeenCalledTimes(2)
      expect(mockCacheService.setCachedFood).toHaveBeenCalledWith(
        'Chicken',
        { proteinPer100g: 26 }
      )
      expect(mockCacheService.setCachedFood).toHaveBeenCalledWith(
        'Egg',
        { proteinPer100g: 13 }
      )
    })

    it('should return empty array on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const resultPromise = searchFood('chicken', mockCacheService)

      // Fast-forward through all retry delays: 3s, 6s, 12s
      await vi.advanceTimersByTimeAsync(3000)
      await vi.advanceTimersByTimeAsync(6000)
      await vi.advanceTimersByTimeAsync(12000)

      const result = await resultPromise

      expect(result).toEqual([])
    })

    it('should retry on network error and succeed on second attempt', async () => {
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            products: [
              {
                product_name: 'Chicken Breast',
                proteins_100g: 26,
              },
            ],
          }),
        })

      global.fetch = mockFetch

      const resultPromise = searchFood('chicken', mockCacheService)

      // Fast-forward through first retry delay (3000ms)
      await vi.advanceTimersByTimeAsync(3000)

      const result = await resultPromise

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Chicken Breast')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should return empty array after all retries are exhausted', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('Network error'))

      const resultPromise = searchFood('chicken', mockCacheService)

      // Fast-forward through all retry delays: 3s, 6s, 12s
      await vi.advanceTimersByTimeAsync(3000)
      await vi.advanceTimersByTimeAsync(6000)
      await vi.advanceTimersByTimeAsync(12000)

      const result = await resultPromise

      expect(result).toEqual([])
      expect(global.fetch).toHaveBeenCalledTimes(4) // 1 initial + 3 retries
    })
  })

  describe('getFoodFromCache', () => {
    it('should return cached food with cached flag set to true', () => {
      mockCacheService.getCachedFood.mockReturnValue({
        proteinPer100g: 26,
        timestamp: Date.now(),
      })

      const result = getFoodFromCache('Chicken', mockCacheService)

      expect(result).toEqual({
        proteinPer100g: 26,
        cached: true,
      })
      expect(mockCacheService.getCachedFood).toHaveBeenCalledWith('Chicken')
    })

    it('should return null when food is not in cache', () => {
      mockCacheService.getCachedFood.mockReturnValue(null)

      const result = getFoodFromCache('UnknownFood', mockCacheService)

      expect(result).toBeNull()
      expect(mockCacheService.getCachedFood).toHaveBeenCalledWith(
        'UnknownFood'
      )
    })
  })
})
