/**
 * Calculator Service - Performs protein calculations for the protein tracker
 * Handles protein calculations, target determination, and progress visualization
 */

/**
 * Calculate protein amount from grams and protein per 100g
 * Formula: (grams × proteinPer100g) / 100
 * @param {number} grams - amount of food in grams
 * @param {number} proteinPer100g - protein content per 100g of food
 * @returns {number} protein in grams
 */
export function calculateProtein(grams, proteinPer100g) {
  return (grams * proteinPer100g) / 100
}

/**
 * Calculate daily protein target based on body weight
 * Formula: bodyweight × 1.0 (1g per kg of body weight)
 * @param {number} bodyweightKg - body weight in kilograms
 * @returns {number} daily protein target in grams
 */
export function calculateTarget(bodyweightKg) {
  return bodyweightKg * 1.0
}

/**
 * Calculate total protein from an array of food items
 * @param {Array<{grams: number, proteinPer100g: number}>} foods - array of food objects
 * @returns {number} total protein in grams
 */
export function calculateTotalProtein(foods) {
  return foods.reduce((total, food) => {
    return total + calculateProtein(food.grams, food.proteinPer100g)
  }, 0)
}

/**
 * Get progress color based on consumed protein vs target
 * Color mapping:
 * - red: < 60% of target
 * - orange: 60-80% of target
 * - yellow: 80-100% of target
 * - green: ≥ 100% of target
 * @param {number} consumed - consumed protein in grams
 * @param {number} target - daily protein target in grams
 * @returns {'red' | 'orange' | 'yellow' | 'green'} progress color
 */
export function getProgressColor(consumed, target) {
  if (target === 0) {
    return 'green'
  }

  const percentage = (consumed / target) * 100

  if (percentage >= 100) {
    return 'green'
  } else if (percentage >= 80) {
    return 'yellow'
  } else if (percentage >= 60) {
    return 'orange'
  } else {
    return 'red'
  }
}
