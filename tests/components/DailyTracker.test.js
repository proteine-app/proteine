import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyTracker from '../../src/components/DailyTracker.vue'

describe('DailyTracker Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = null
  })

  it('should render the component with initial state', () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.daily-tracker').exists()).toBe(true)
  })

  it('should display body weight input field', () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    const input = wrapper.find('input[type="number"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('body weight')
  })

  it('should calculate and display daily target based on body weight', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(75)

    const target = wrapper.find('[data-testid="daily-target"]')
    expect(target.exists()).toBe(true)
    expect(target.text()).toContain('75')
  })

  it('should display consumed protein total from foods array', async () => {
    const foods = [
      { grams: 100, proteinPer100g: 26 },
      { grams: 150, proteinPer100g: 2.7 },
    ]

    wrapper = mount(DailyTracker, {
      props: {
        foods,
      },
    })

    const consumed = wrapper.find('[data-testid="consumed-protein"]')
    expect(consumed.exists()).toBe(true)
    expect(consumed.text()).toContain('30')
  })

  it('should display progress bar with correct color based on progress', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [{ grams: 100, proteinPer100g: 26 }],
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    const progressBar = wrapper.find('[data-testid="progress-bar"]')
    expect(progressBar.exists()).toBe(true)

    const progressClass = progressBar.classes()
    // 100g food with 26% protein = 26g consumed vs 100g target = 26% (red)
    expect(progressClass).toContain('progress-red')
  })

  it('should emit weight-changed event when body weight input changes', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(80)

    expect(wrapper.emitted('weight-changed')).toBeTruthy()
    expect(wrapper.emitted('weight-changed')[0]).toEqual([80])
  })

  it('should emit reset-clicked event when reset day button is clicked', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    global.confirm = vi.fn(() => true)

    const resetButton = wrapper.find('[data-testid="reset-button"]')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset-clicked')).toBeTruthy()
    expect(global.confirm).toHaveBeenCalled()
  })

  it('should not emit reset-clicked if user cancels confirmation dialog', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    global.confirm = vi.fn(() => false)

    const resetButton = wrapper.find('[data-testid="reset-button"]')
    await resetButton.trigger('click')

    expect(wrapper.emitted('reset-clicked')).toBeFalsy()
  })

  it('should clear body weight when delete weight button is clicked', async () => {
    wrapper = mount(DailyTracker, {
      props: {
        foods: [],
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(75)

    const deleteButton = wrapper.find('[data-testid="delete-weight-button"]')
    await deleteButton.trigger('click')

    expect(input.element.value).toBe('')
  })

  it('should update progress bar color when consumed protein changes', async () => {
    const foods = [{ grams: 50, proteinPer100g: 26 }]

    wrapper = mount(DailyTracker, {
      props: {
        foods,
      },
    })

    const input = wrapper.find('input[type="number"]')
    await input.setValue(100)

    const progressBar = wrapper.find('[data-testid="progress-bar"]')
    expect(progressBar.exists()).toBe(true)
  })
})
