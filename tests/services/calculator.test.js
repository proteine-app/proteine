import { describe, it, expect } from 'vitest'
import {
  calculateProtein,
  calculateTarget,
  calculateTotalProtein,
  getProgressColor,
} from '../../src/services/calculator.js'

describe('Calculator Service', () => {
  describe('calculateProtein', () => {
    it('should calculate protein for basic values', () => {
      const result = calculateProtein(100, 26)
      expect(result).toBe(26)
    })

    it('should handle decimal values correctly', () => {
      const result = calculateProtein(150, 2.7)
      expect(result).toBeCloseTo(4.05, 2)
    })

    it('should handle zero grams', () => {
      const result = calculateProtein(0, 26)
      expect(result).toBe(0)
    })

    it('should handle decimal grams and protein values', () => {
      const result = calculateProtein(75.5, 12.3)
      expect(result).toBeCloseTo(9.2865, 3)
    })
  })

  describe('calculateTarget', () => {
    it('should calculate target for whole body weight', () => {
      const result = calculateTarget(75)
      expect(result).toBe(75)
    })

    it('should handle decimal body weight', () => {
      const result = calculateTarget(72.5)
      expect(result).toBe(72.5)
    })

    it('should return zero for zero body weight', () => {
      const result = calculateTarget(0)
      expect(result).toBe(0)
    })
  })

  describe('calculateTotalProtein', () => {
    it('should sum protein from multiple foods', () => {
      const foods = [
        { grams: 100, proteinPer100g: 26 }, // 26g protein
        { grams: 150, proteinPer100g: 2.7 }, // 4.05g protein
      ]
      const result = calculateTotalProtein(foods)
      expect(result).toBeCloseTo(30.05, 2)
    })

    it('should return zero for empty food array', () => {
      const result = calculateTotalProtein([])
      expect(result).toBe(0)
    })

    it('should handle decimal food values', () => {
      const foods = [
        { grams: 75.5, proteinPer100g: 12.3 },
        { grams: 50.25, proteinPer100g: 8.5 },
      ]
      const result = calculateTotalProtein(foods)
      expect(result).toBeCloseTo(13.55775, 4)
    })

    it('should handle single food item', () => {
      const foods = [{ grams: 200, proteinPer100g: 20 }]
      const result = calculateTotalProtein(foods)
      expect(result).toBe(40)
    })
  })

  describe('getProgressColor', () => {
    it('should return red when under 60% of target', () => {
      expect(getProgressColor(29, 100)).toBe('red')
    })

    it('should return orange when at 60-80% of target', () => {
      expect(getProgressColor(60, 100)).toBe('orange')
      expect(getProgressColor(75, 100)).toBe('orange')
    })

    it('should return yellow when at 80-100% of target', () => {
      expect(getProgressColor(80, 100)).toBe('yellow')
      expect(getProgressColor(99, 100)).toBe('yellow')
    })

    it('should return green when at or above 100% of target', () => {
      expect(getProgressColor(100, 100)).toBe('green')
      expect(getProgressColor(120, 100)).toBe('green')
    })

    it('should handle decimal values correctly', () => {
      const target = 75.5
      expect(getProgressColor(30.2, target)).toBe('red') // ~40%
      expect(getProgressColor(45.3, target)).toBe('orange') // ~60%
      expect(getProgressColor(60.4, target)).toBe('yellow') // ~80%
      expect(getProgressColor(75.5, target)).toBe('green') // 100%
    })

    it('should handle zero target gracefully', () => {
      expect(getProgressColor(0, 0)).toBe('green')
      expect(getProgressColor(50, 0)).toBe('green')
    })

    it('should handle exact percentage thresholds', () => {
      // Test exact boundaries
      expect(getProgressColor(59.99, 100)).toBe('red')
      expect(getProgressColor(60, 100)).toBe('orange')
      expect(getProgressColor(79.99, 100)).toBe('orange')
      expect(getProgressColor(80, 100)).toBe('yellow')
      expect(getProgressColor(99.99, 100)).toBe('yellow')
      expect(getProgressColor(100, 100)).toBe('green')
    })
  })
})
