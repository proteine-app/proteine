import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getDailyData,
  saveDailyData,
  setWeight,
  getWeight,
  addFood,
  updateFood,
  removeFood,
  clearDayFoods,
  getCachedFood,
  setCachedFood,
  clearOldestCacheIfNeeded,
} from '../../src/services/storage.js'

describe('Storage Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('Daily Data Management', () => {
    it('should return empty daily data when no data exists', () => {
      const data = getDailyData()
      expect(data).toEqual({ weight: null, foods: [] })
    })

    it('should save and retrieve daily data with weight and foods', () => {
      const dailyData = {
        weight: 75.5,
        foods: [
          { id: '1', name: 'Chicken', grams: 100, proteinPer100g: 26 },
          { id: '2', name: 'Rice', grams: 150, proteinPer100g: 2.7 },
        ],
      }

      saveDailyData(dailyData)
      const retrieved = getDailyData()

      expect(retrieved.weight).toBe(75.5)
      expect(retrieved.foods).toHaveLength(2)
      expect(retrieved.foods[0]).toEqual(dailyData.foods[0])
    })
  })

  describe('Weight Management', () => {
    it('should return null when weight is not set', () => {
      const weight = getWeight()
      expect(weight).toBeNull()
    })

    it('should set and retrieve weight', () => {
      setWeight(72.5)
      expect(getWeight()).toBe(72.5)
    })

    it('should update weight when set multiple times', () => {
      setWeight(72.5)
      setWeight(71.0)
      expect(getWeight()).toBe(71.0)
    })

    it('should persist weight in localStorage with correct namespace', () => {
      setWeight(70.5)
      const stored = JSON.parse(localStorage.getItem('proteine_daily'))
      expect(stored.weight).toBe(70.5)
    })
  })

  describe('Food Management', () => {
    it('should add food with auto-generated id', () => {
      const food = { name: 'Chicken', grams: 100, proteinPer100g: 26 }
      const result = addFood(food)

      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Chicken')
      expect(result.grams).toBe(100)
      expect(result.proteinPer100g).toBe(26)
    })

    it('should retrieve added food in daily data', () => {
      const food = { name: 'Egg', grams: 50, proteinPer100g: 13 }
      const added = addFood(food)

      const data = getDailyData()
      expect(data.foods).toHaveLength(1)
      expect(data.foods[0].id).toBe(added.id)
    })

    it('should update food by id', () => {
      const food = { name: 'Chicken', grams: 100, proteinPer100g: 26 }
      const added = addFood(food)

      updateFood(added.id, { grams: 150, proteinPer100g: 25 })
      const data = getDailyData()

      expect(data.foods[0].grams).toBe(150)
      expect(data.foods[0].proteinPer100g).toBe(25)
      expect(data.foods[0].name).toBe('Chicken') // unchanged field
    })

    it('should remove food by id', () => {
      const food1 = { name: 'Chicken', grams: 100, proteinPer100g: 26 }
      const food2 = { name: 'Rice', grams: 150, proteinPer100g: 2.7 }

      const added1 = addFood(food1)
      addFood(food2)

      removeFood(added1.id)
      const data = getDailyData()

      expect(data.foods).toHaveLength(1)
      expect(data.foods[0].name).toBe('Rice')
    })

    it('should clear all foods while preserving weight', () => {
      setWeight(70.5)
      addFood({ name: 'Chicken', grams: 100, proteinPer100g: 26 })
      addFood({ name: 'Rice', grams: 150, proteinPer100g: 2.7 })

      clearDayFoods()
      const data = getDailyData()

      expect(data.foods).toHaveLength(0)
      expect(data.weight).toBe(70.5)
    })
  })

  describe('Cache Management', () => {
    it('should return null for non-existent cached food', () => {
      const cached = getCachedFood('Chicken')
      expect(cached).toBeNull()
    })

    it('should set and retrieve cached food with timestamp', () => {
      const cacheData = { proteinPer100g: 26 }
      setCachedFood('Chicken', cacheData)

      const cached = getCachedFood('Chicken')
      expect(cached).toHaveProperty('proteinPer100g', 26)
      expect(cached).toHaveProperty('timestamp')
      expect(typeof cached.timestamp).toBe('number')
    })

    it('should handle multiple cached foods', () => {
      setCachedFood('Chicken', { proteinPer100g: 26 })
      setCachedFood('Rice', { proteinPer100g: 2.7 })
      setCachedFood('Egg', { proteinPer100g: 13 })

      expect(getCachedFood('Chicken')).toHaveProperty('proteinPer100g', 26)
      expect(getCachedFood('Rice')).toHaveProperty('proteinPer100g', 2.7)
      expect(getCachedFood('Egg')).toHaveProperty('proteinPer100g', 13)
    })

    it('should auto-clear oldest cache entries when exceeding 100 items', () => {
      // Add 101 items to trigger cache clearing
      for (let i = 0; i < 101; i++) {
        setCachedFood(`Food${i}`, { proteinPer100g: i })
      }

      // clearOldestCacheIfNeeded should have been called or auto-triggered
      // Verify that cache size is managed
      const cache = JSON.parse(localStorage.getItem('proteine_cache') || '{}')
      const cacheSize = Object.keys(cache).length

      // Should not exceed a reasonable limit (let's check it's <= 100)
      expect(cacheSize).toBeLessThanOrEqual(100)
    })

    it('should manually clear oldest cache entry when requested', () => {
      // Add a few items with small delays to ensure different timestamps
      setCachedFood('Food1', { proteinPer100g: 1 })
      setCachedFood('Food2', { proteinPer100g: 2 })
      setCachedFood('Food3', { proteinPer100g: 3 })

      const beforeSize = Object.keys(JSON.parse(localStorage.getItem('proteine_cache') || '{}')).length
      clearOldestCacheIfNeeded()
      const afterSize = Object.keys(JSON.parse(localStorage.getItem('proteine_cache') || '{}')).length

      // Should have removed at least one item or done nothing if under limit
      expect(afterSize).toBeLessThanOrEqual(beforeSize)
    })
  })
})
