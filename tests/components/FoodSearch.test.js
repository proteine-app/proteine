import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock the API service - must come before importing the component
vi.mock('../../src/services/api.js', () => ({
  searchFood: vi.fn(),
}))

// Mock the storage service - must come before importing the component
vi.mock('../../src/services/storage.js', () => ({
  getCachedFood: vi.fn(),
  setCachedFood: vi.fn(),
}))

import FoodSearch from '../../src/components/FoodSearch.vue'
import { searchFood } from '../../src/services/api.js'

describe('FoodSearch Component', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders the search input field', () => {
    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Search for food...')
  })

  it('debounces search and displays results after 300ms', async () => {
    searchFood.mockResolvedValue([
      { name: 'Chicken Breast', proteinPer100g: 26 },
      { name: 'Chicken Thigh', proteinPer100g: 20 },
    ])

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    // Type in the input
    await input.setValue('chicken')
    await input.trigger('input')

    // Should not have results immediately
    expect(wrapper.find('.results-list').exists()).toBe(false)

    // Wait for debounce + promise
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    // Now should have results
    expect(wrapper.find('.results-list').exists()).toBe(true)
    const items = wrapper.findAll('.result-item')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Chicken Breast')
    expect(items[0].text()).toContain('26g protein/100g')
  })

  it('displays loading state while searching', async () => {
    searchFood.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([{ name: 'Rice', proteinPer100g: 2.7 }]),
            100
          )
        )
    )

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    await input.setValue('rice')
    await input.trigger('input')

    // Advance past debounce
    await new Promise((resolve) => setTimeout(resolve, 320))
    await wrapper.vm.$nextTick()

    // Should show loading
    expect(wrapper.find('.loading').exists()).toBe(true)

    // Wait for search to complete
    await new Promise((resolve) => setTimeout(resolve, 150))
    await wrapper.vm.$nextTick()

    // Loading should be gone, results should appear
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.find('.results-list').exists()).toBe(true)
  })

  it('displays error message when search fails', async () => {
    searchFood.mockRejectedValue(new Error('Network error'))

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    await input.setValue('test')
    await input.trigger('input')

    // Wait for debounce + promise
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error').text()).toContain(
      'Failed to search foods'
    )
  })

  it('emits food-selected event with correct data when result is clicked', async () => {
    const mockFood = { name: 'Salmon', proteinPer100g: 25 }
    searchFood.mockResolvedValue([mockFood])

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    await input.setValue('salmon')
    await input.trigger('input')

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    // Click the result button
    const resultButton = wrapper.find('.result-button')
    await resultButton.trigger('click')

    expect(wrapper.emitted('food-selected')).toBeTruthy()
    expect(wrapper.emitted('food-selected')[0]).toEqual([
      {
        name: 'Salmon',
        proteinPer100g: 25,
      },
    ])
  })

  it('clears search and results after food selection', async () => {
    const mockFood = { name: 'Egg', proteinPer100g: 13 }
    searchFood.mockResolvedValue([mockFood])

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    await input.setValue('egg')
    await input.trigger('input')

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.results-list').exists()).toBe(true)

    // Click the result button
    const resultButton = wrapper.find('.result-button')
    await resultButton.trigger('click')
    await wrapper.vm.$nextTick()

    // Input should be cleared
    expect(wrapper.vm.searchQuery).toBe('')
    // Results should be cleared
    expect(wrapper.find('.results-list').exists()).toBe(false)
  })

  it('displays no-results message when search returns empty array', async () => {
    searchFood.mockResolvedValue([])

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    await input.setValue('nonexistentfood')
    await input.trigger('input')

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.find('.no-results').text()).toContain('No foods found')
  })

  it('clears results when search input is emptied', async () => {
    searchFood.mockResolvedValue([
      { name: 'Bread', proteinPer100g: 8 },
    ])

    wrapper = mount(FoodSearch)
    const input = wrapper.find('.search-input')

    // Type and search
    await input.setValue('bread')
    await input.trigger('input')

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 350))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.results-list').exists()).toBe(true)

    // Clear the input
    await input.setValue('')
    await input.trigger('input')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.results-list').exists()).toBe(false)
    expect(wrapper.find('.no-results').exists()).toBe(false)
  })
})
