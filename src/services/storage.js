/**
 * Storage Service - Manages persistent data for the protein tracker
 * Uses localStorage with two namespaces:
 * - "proteine_daily": stores weight and daily foods array
 * - "proteine_cache": stores cached food search results
 */

const DAILY_NAMESPACE = 'proteine_daily'
const CACHE_NAMESPACE = 'proteine_cache'
const CACHE_LIMIT = 100

/**
 * Generate a unique ID for foods
 */
function generateId() {
  return crypto.randomUUID()
}

/**
 * Get the complete daily data (weight + foods)
 * @returns {{weight: number | null, foods: Array}}
 */
export function getDailyData() {
  const stored = localStorage.getItem(DAILY_NAMESPACE)
  if (!stored) {
    return { weight: null, foods: [] }
  }
  return JSON.parse(stored)
}

/**
 * Save the complete daily data
 * @param {Object} data - {weight, foods}
 */
export function saveDailyData(data) {
  localStorage.setItem(DAILY_NAMESPACE, JSON.stringify(data))
}

/**
 * Set the user's weight
 * @param {number} kg - weight in kilograms
 */
export function setWeight(kg) {
  const data = getDailyData()
  data.weight = kg
  saveDailyData(data)
}

/**
 * Get the user's weight
 * @returns {number | null} weight in kilograms or null if not set
 */
export function getWeight() {
  return getDailyData().weight
}

/**
 * Add a food item to today's foods
 * @param {Object} food - {name, grams, proteinPer100g}
 * @returns {Object} food with generated id
 */
export function addFood(food) {
  const data = getDailyData()
  const foodWithId = {
    id: generateId(),
    ...food,
  }
  data.foods.push(foodWithId)
  saveDailyData(data)
  return foodWithId
}

/**
 * Update a food item by id
 * @param {string} id - food id
 * @param {Object} updates - partial updates to apply
 */
export function updateFood(id, updates) {
  const data = getDailyData()
  const food = data.foods.find((f) => f.id === id)
  if (food) {
    Object.assign(food, updates)
    saveDailyData(data)
  }
}

/**
 * Remove a food item by id
 * @param {string} id - food id
 */
export function removeFood(id) {
  const data = getDailyData()
  data.foods = data.foods.filter((f) => f.id !== id)
  saveDailyData(data)
}

/**
 * Clear all foods for the day (weight persists)
 */
export function clearDayFoods() {
  const data = getDailyData()
  data.foods = []
  saveDailyData(data)
}

/**
 * Get a cached food by name
 * @param {string} name - food name
 * @returns {Object | null} {proteinPer100g, timestamp} or null
 */
export function getCachedFood(name) {
  const cache = JSON.parse(localStorage.getItem(CACHE_NAMESPACE) || '{}')
  return cache[name] || null
}

/**
 * Cache a food with its protein value
 * @param {string} name - food name
 * @param {Object} data - {proteinPer100g}
 */
export function setCachedFood(name, data) {
  const cache = JSON.parse(localStorage.getItem(CACHE_NAMESPACE) || '{}')
  cache[name] = {
    ...data,
    timestamp: Date.now(),
  }
  localStorage.setItem(CACHE_NAMESPACE, JSON.stringify(cache))

  // Clear oldest if we've exceeded limit
  clearOldestCacheIfNeeded()
}

/**
 * Clear the oldest cache entry if cache size exceeds limit
 */
export function clearOldestCacheIfNeeded() {
  const cache = JSON.parse(localStorage.getItem(CACHE_NAMESPACE) || '{}')
  const entries = Object.entries(cache)

  if (entries.length > CACHE_LIMIT) {
    // Find the entry with the oldest timestamp
    let oldest = entries[0]
    for (const entry of entries) {
      if (entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry
      }
    }

    // Remove the oldest entry
    delete cache[oldest[0]]
    localStorage.setItem(CACHE_NAMESPACE, JSON.stringify(cache))
  }
}
