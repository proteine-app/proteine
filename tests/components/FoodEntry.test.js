import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FoodEntry from '../../src/components/FoodEntry.vue'

describe('FoodEntry Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  const createComponent = (props = {}) => {
    return mount(FoodEntry, {
      props,
    })
  }

  it('should render the component with a selected food', () => {
    wrapper = createComponent({
      selectedFood: { name: 'Chicken Breast', proteinPer100g: 26 },
    })

    expect(wrapper.find('.food-entry-container').exists()).toBe(true)
    expect(wrapper.text()).toContain('Chicken Breast')
  })

  it('should display the food name in the heading', () => {
    wrapper = createComponent({
      selectedFood: { name: 'Salmon', proteinPer100g: 25 },
    })

    expect(wrapper.find('h2').text()).toBe('Salmon')
  })

  it('should update grams input and reflect in data', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Beef', proteinPer100g: 26 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(150)

    expect(wrapper.vm.grams).toBe(150)
  })

  it('should calculate and display protein correctly', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Chicken Breast', proteinPer100g: 26 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    // calculateProtein(100, 26) = (100 * 26) / 100 = 26
    expect(wrapper.vm.proteinAmount).toBe(26)
    expect(wrapper.text()).toContain('26')
  })

  it('should emit food-added event with correct data when adding food', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Turkey', proteinPer100g: 29 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(200)

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('food-added')).toHaveLength(1)
    const emittedData = wrapper.emitted('food-added')[0][0]
    expect(emittedData).toEqual({
      name: 'Turkey',
      grams: 200,
      proteinPer100g: 29,
    })
  })

  it('should clear grams input after adding food', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Tuna', proteinPer100g: 26 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    expect(wrapper.vm.grams).toBe(100)

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.vm.grams).toBeNull()
  })

  it('should display validation error for zero or negative grams', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Chicken', proteinPer100g: 26 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(-10)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error').text()).toContain('Grams must be a positive number')
  })

  it('should disable the Add button when grams is invalid', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Fish', proteinPer100g: 20 },
    })

    const button = wrapper.find('button')

    // Initially no grams
    expect(button.attributes('disabled')).toBeDefined()

    const input = wrapper.find('input[type="number"]')
    await input.setValue(0)
    await wrapper.vm.$nextTick()

    // Button should be disabled
    expect(button.attributes('disabled')).toBeDefined()

    // Set valid grams
    await input.setValue(100)
    await wrapper.vm.$nextTick()

    // Button should not be disabled
    expect(button.attributes('disabled')).toBeUndefined()
  })

  it('should show "no food selected" message when selectedFood is null', () => {
    wrapper = createComponent({
      selectedFood: null,
    })

    expect(wrapper.find('.no-food-selected').exists()).toBe(true)
    expect(wrapper.text()).toContain('Select a food to get started')
  })

  it('should reset grams when selectedFood prop changes', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Chicken', proteinPer100g: 26 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    expect(wrapper.vm.grams).toBe(100)

    // Change the selectedFood
    await wrapper.setProps({
      selectedFood: { name: 'Beef', proteinPer100g: 26 },
    })

    expect(wrapper.vm.grams).toBeNull()
  })

  it('should calculate protein with decimal values correctly', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Egg White', proteinPer100g: 10.9 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    // calculateProtein(100, 10.9) = 10.9
    expect(wrapper.vm.proteinAmount).toBe(10.9)
  })

  it('should handle food with fractional protein per 100g', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Rice', proteinPer100g: 2.7 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(150)

    // calculateProtein(150, 2.7) = (150 * 2.7) / 100 = 4.05
    expect(wrapper.vm.proteinAmount).toBe(4.05)
  })

  it('should not emit event when button is clicked with invalid grams', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Chicken', proteinPer100g: 26 },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('food-added')).toBeUndefined()
  })

  it('should round protein display to 2 decimal places', async () => {
    wrapper = createComponent({
      selectedFood: { name: 'Complex Food', proteinPer100g: 12.345 },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(75.5)

    // calculateProtein(75.5, 12.345) = (75.5 * 12.345) / 100 = 9.320475
    // Should be rounded to 2 decimal places = 9.32
    expect(wrapper.vm.proteinAmount).toBe(9.32)
  })
})
