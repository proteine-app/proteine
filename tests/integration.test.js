import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import { clearDayFoods, getDailyData } from '../src/services/storage.js'

describe('Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Mock the global fetch function
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Full User Flow - Weight to Reset', () => {
    it('should complete full user flow: weight → search → add → view → reset', async () => {
      // Mock the fetch function for searchFood API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              product_name: 'Chicken Breast',
              proteins_100g: 26,
            },
            {
              product_name: 'Chicken Thigh',
              proteins_100g: 20,
            },
          ],
        }),
      })

      // Mount the full App component
      const wrapper = mount(App, {
        global: {
          stubs: {
            // Don't stub components - we want to test full integration
          },
        },
      })

      // Step 1: Enter weight (75 kg)
      const weightInput = wrapper.find('input[id="body-weight-input"]')
      expect(weightInput.exists()).toBe(true)
      await weightInput.setValue(75)
      await wrapper.vm.$nextTick()

      // Verify weight was saved and daily target is calculated
      const dailyTarget = wrapper.find('[data-testid="daily-target"]')
      expect(dailyTarget.text()).toContain('75.0') // 75 * 1.0 = 75

      // Step 2: Search for food ("chicken")
      const searchInput = wrapper.find('input[aria-label="Food search"]')
      expect(searchInput.exists()).toBe(true)
      await searchInput.setValue('chicken')
      // Trigger the input event to start the search
      await searchInput.trigger('input')

      // Wait for debounce (300ms) and the fetch to complete
      await new Promise(resolve => setTimeout(resolve, 400))
      await wrapper.vm.$nextTick()

      // Verify search results appear
      const resultsList = wrapper.find('.results-list')
      expect(resultsList.exists()).toBe(true)

      const resultItems = wrapper.findAll('.result-item')
      expect(resultItems.length).toBeGreaterThan(0)

      // Step 3: Select food from results ("Chicken Breast")
      const firstResultButton = wrapper.find('.result-button')
      expect(firstResultButton.exists()).toBe(true)
      await firstResultButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Verify selected food appears in FoodEntry component
      const foodEntryTitle = wrapper.find('.food-entry-container h2')
      expect(foodEntryTitle.text()).toBe('Chicken Breast')

      // Step 4: Enter grams (100g)
      const gramsInput = wrapper.find('input[id="grams-input"]')
      expect(gramsInput.exists()).toBe(true)
      await gramsInput.setValue(100)
      await wrapper.vm.$nextTick()

      // Verify protein calculation (100g * 26g/100g = 26g protein)
      const proteinDisplay = wrapper.find('.protein-display strong')
      expect(proteinDisplay.text()).toBe('26 g')

      // Step 5: Click "Add to Day"
      const addButton = wrapper.find('.add-button')
      expect(addButton.exists()).toBe(true)
      expect(addButton.attributes('disabled')).not.toBeDefined()
      await addButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Step 6: Verify food appears in the daily log with correct totals
      const foodRows = wrapper.findAll('.food-row')
      expect(foodRows.length).toBeGreaterThan(0)

      const foodNameInLog = wrapper.find('.food-name')
      expect(foodNameInLog.text()).toBe('Chicken Breast')

      const consumedProtein = wrapper.find('[data-testid="consumed-protein"]')
      expect(consumedProtein.text()).toBe('26.0g')

      // Verify search input is cleared after selection
      const searchInputAfterAdd = wrapper.find('input[aria-label="Food search"]')
      expect(searchInputAfterAdd.element.value).toBe('')

      // Step 7: Test reset functionality
      const resetButton = wrapper.find('[data-testid="reset-button"]')
      expect(resetButton.exists()).toBe(true)

      // Mock window.confirm for the reset confirmation
      window.confirm = vi.fn(() => true)

      await resetButton.trigger('click')
      await wrapper.vm.$nextTick()

      // Verify daily log is cleared
      const emptyState = wrapper.find('.empty-state')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No foods added yet')

      // Verify consumed protein is reset to 0
      const consumedProteinAfterReset = wrapper.find('[data-testid="consumed-protein"]')
      expect(consumedProteinAfterReset.text()).toBe('0.0g')

      // Verify weight is still saved (not cleared by reset)
      const dailyTargetAfterReset = wrapper.find('[data-testid="daily-target"]')
      expect(dailyTargetAfterReset.text()).toContain('75.0')

      // Clean up
      window.confirm.mockRestore()
    })
  })

  describe('localStorage Persistence Verification', () => {
    it('should persist data to localStorage and reload on next mount', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              product_name: 'Rice',
              proteins_100g: 2.7,
            },
          ],
        }),
      })

      // First mount: Add data
      const wrapper1 = mount(App, {
        global: {
          stubs: {
            // Full integration test - no stubs
          },
        },
      })

      // Enter weight
      const weightInput1 = wrapper1.find('input[id="body-weight-input"]')
      await weightInput1.setValue(80)
      await wrapper1.vm.$nextTick()

      // Verify weight was changed in the App's handler
      expect(weightInput1.element.value).toBe('80')

      // Search and add food
      const searchInput1 = wrapper1.find('input[aria-label="Food search"]')
      await searchInput1.setValue('rice')
      await searchInput1.trigger('input')

      await new Promise(resolve => setTimeout(resolve, 400))
      await wrapper1.vm.$nextTick()

      const resultButton1 = wrapper1.find('.result-button')
      await resultButton1.trigger('click')
      await wrapper1.vm.$nextTick()

      const gramsInput1 = wrapper1.find('input[id="grams-input"]')
      await gramsInput1.setValue(200)
      await wrapper1.vm.$nextTick()

      const addButton1 = wrapper1.find('.add-button')
      await addButton1.trigger('click')
      await wrapper1.vm.$nextTick()

      // Verify data is stored in localStorage
      const storedData = JSON.parse(localStorage.getItem('proteine_daily'))
      expect(storedData).toBeDefined()
      expect(storedData.weight).toBe(80)
      expect(storedData.foods).toHaveLength(1)
      expect(storedData.foods[0].name).toBe('Rice')
      expect(storedData.foods[0].grams).toBe(200)
      expect(storedData.foods[0].proteinPer100g).toBe(2.7)

      // Verify cache is persisted for the searched food
      const cacheAfterFirstMount = JSON.parse(localStorage.getItem('proteine_cache') || '{}')
      expect(cacheAfterFirstMount['Rice']).toBeDefined()
      expect(cacheAfterFirstMount['Rice'].proteinPer100g).toBe(2.7)

      // Unmount the first instance
      wrapper1.unmount()

      // Second mount: Verify food data is loaded from localStorage
      const wrapper2 = mount(App, {
        global: {
          stubs: {
            // Full integration test - no stubs
          },
        },
      })

      await wrapper2.vm.$nextTick()

      // Enter the same weight again (simulating user re-entering it)
      const weightInput2 = wrapper2.find('input[id="body-weight-input"]')
      await weightInput2.setValue(80)
      await wrapper2.vm.$nextTick()

      // Verify daily target is calculated with the weight
      const dailyTarget2 = wrapper2.find('[data-testid="daily-target"]')
      expect(dailyTarget2.text()).toContain('80.0') // 80 * 1.0 = 80

      // Verify food is restored in the log (loaded from storage on mount)
      const foodRows2 = wrapper2.findAll('.food-row')
      expect(foodRows2.length).toBeGreaterThan(0)

      const foodName2 = wrapper2.find('.food-name')
      expect(foodName2.text()).toBe('Rice')

      const foodGrams2 = wrapper2.find('.food-grams')
      expect(foodGrams2.text()).toBe('200g')

      // Verify consumed protein is correctly displayed (loaded from storage)
      const consumedProtein2 = wrapper2.find('[data-testid="consumed-protein"]')
      // 200g * 2.7g/100g = 5.4g
      expect(consumedProtein2.text()).toBe('5.4g')

      // Verify cache is still persisted for the searched food
      const cacheAfterSecondMount = JSON.parse(localStorage.getItem('proteine_cache') || '{}')
      expect(cacheAfterSecondMount['Rice']).toBeDefined()
      expect(cacheAfterSecondMount['Rice'].proteinPer100g).toBe(2.7)

      // Verify localStorage still contains the food data
      const storedDataAfterSecondMount = JSON.parse(localStorage.getItem('proteine_daily'))
      expect(storedDataAfterSecondMount.foods).toHaveLength(1)
      expect(storedDataAfterSecondMount.foods[0].name).toBe('Rice')
      expect(storedDataAfterSecondMount.weight).toBe(80)

      wrapper2.unmount()
    })
  })
})
