import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyLog from '../../src/components/DailyLog.vue'

describe('DailyLog Component', () => {
  let mockFoods

  beforeEach(() => {
    mockFoods = [
      {
        id: '1',
        name: 'Chicken Breast',
        grams: 100,
        proteinPer100g: 26,
      },
      {
        id: '2',
        name: 'Rice',
        grams: 150,
        proteinPer100g: 2.7,
      },
    ]
  })

  it('should render empty state when no foods provided', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: [],
      },
    })

    expect(wrapper.text()).toContain('No foods added yet')
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('should render all foods in the list', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    expect(wrapper.findAll('.food-row')).toHaveLength(2)
    expect(wrapper.text()).toContain('Chicken Breast')
    expect(wrapper.text()).toContain('Rice')
  })

  it('should display food details correctly (name, grams, protein)', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const firstRow = wrapper.findAll('.food-display')[0]
    expect(firstRow.text()).toContain('Chicken Breast')
    expect(firstRow.text()).toContain('100g')
    expect(firstRow.text()).toContain('26.0g') // protein: (100 * 26) / 100 = 26
  })

  it('should calculate and display protein correctly', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const rows = wrapper.findAll('.food-display')
    // First food: 100g * 26/100 = 26g protein
    expect(rows[0].text()).toContain('26.0g')
    // Second food: 150g * 2.7/100 = 4.05g protein (displayed as 4.0g after rounding)
    expect(rows[1].text()).toContain('4.0g')
  })

  it('should emit food-deleted event with food id when delete is confirmed', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    // Mock window.confirm to return true
    vi.stubGlobal('confirm', vi.fn(() => true))

    const deleteButton = wrapper.find('.btn-delete')
    await deleteButton.trigger('click')

    expect(wrapper.emitted('food-deleted')).toBeTruthy()
    expect(wrapper.emitted('food-deleted')[0]).toEqual(['1'])
  })

  it('should not emit food-deleted event when delete is cancelled', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    // Mock window.confirm to return false
    vi.stubGlobal('confirm', vi.fn(() => false))

    const deleteButton = wrapper.find('.btn-delete')
    await deleteButton.trigger('click')

    expect(wrapper.emitted('food-deleted')).toBeFalsy()
  })

  it('should emit food-edit-started event when edit button is clicked', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    expect(wrapper.emitted('food-edit-started')).toBeTruthy()
    expect(wrapper.emitted('food-edit-started')[0][0]).toEqual(mockFoods[0])
  })

  it('should switch to edit mode when edit button is clicked', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    expect(wrapper.find('.food-edit').exists()).toBe(false)
    expect(wrapper.findAll('.food-display').length).toBe(2)

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    expect(wrapper.find('.food-edit').exists()).toBe(true)
    expect(wrapper.findAll('.food-display').length).toBe(1)
  })

  it('should populate edit input with current grams value', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    expect(input.element.value).toBe('100')
  })

  it('should emit food-updated event when save button is clicked', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(150)

    const saveButton = wrapper.find('.btn-save')
    await saveButton.trigger('click')

    expect(wrapper.emitted('food-updated')).toBeTruthy()
    expect(wrapper.emitted('food-updated')[0]).toEqual([
      { id: '1', grams: 150 },
    ])
  })

  it('should calculate updated protein when grams value changes in edit mode', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(200)

    // Protein should now be 200 * 26 / 100 = 52
    const foodEdit = wrapper.find('.food-edit')
    expect(foodEdit.text()).toContain('52.0g')
  })

  it('should cancel edit mode when cancel button is clicked', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    expect(wrapper.find('.food-edit').exists()).toBe(true)

    const cancelButton = wrapper.find('.btn-cancel')
    await cancelButton.trigger('click')

    expect(wrapper.find('.food-edit').exists()).toBe(false)
    expect(wrapper.find('.food-display').exists()).toBe(true)
  })

  it('should submit edit when Enter key is pressed', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(120)
    await input.trigger('keyup.enter')

    expect(wrapper.emitted('food-updated')).toBeTruthy()
    expect(wrapper.emitted('food-updated')[0]).toEqual([
      { id: '1', grams: 120 },
    ])
  })

  it('should cancel edit when Escape key is pressed', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    expect(wrapper.find('.food-edit').exists()).toBe(true)

    const input = wrapper.find('.input-grams')
    await input.trigger('keyup.escape')

    expect(wrapper.find('.food-edit').exists()).toBe(false)
  })

  it('should handle negative grams value by cancelling edit', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(-10)

    const saveButton = wrapper.find('.btn-save')
    await saveButton.trigger('click')

    // Should not emit food-updated, and should exit edit mode
    expect(wrapper.emitted('food-updated')).toBeFalsy()
    expect(wrapper.find('.food-edit').exists()).toBe(false)
  })

  it('should display Edit and Delete buttons for each food', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButtons = wrapper.findAll('.btn-edit')
    const deleteButtons = wrapper.findAll('.btn-delete')

    expect(editButtons).toHaveLength(2)
    expect(deleteButtons).toHaveLength(2)
  })

  it('should maintain separate edit states for different foods', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButtons = wrapper.findAll('.btn-edit')
    // Click edit on first food
    await editButtons[0].trigger('click')
    expect(wrapper.findAll('.food-edit')).toHaveLength(1)
    expect(wrapper.findAll('.food-display')).toHaveLength(1)

    // Cancel edit
    const cancelButton = wrapper.find('.btn-cancel')
    await cancelButton.trigger('click')
    expect(wrapper.find('.food-edit').exists()).toBe(false)
  })

  it('should accept decimal grams values', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(75.5)

    const saveButton = wrapper.find('.btn-save')
    await saveButton.trigger('click')

    expect(wrapper.emitted('food-updated')[0]).toEqual([
      { id: '1', grams: 75.5 },
    ])
  })

  it('should handle zero grams value', async () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const editButton = wrapper.find('.btn-edit')
    await editButton.trigger('click')

    const input = wrapper.find('.input-grams')
    await input.setValue(0)

    const saveButton = wrapper.find('.btn-save')
    await saveButton.trigger('click')

    expect(wrapper.emitted('food-updated')).toBeTruthy()
    expect(wrapper.emitted('food-updated')[0]).toEqual([
      { id: '1', grams: 0 },
    ])
  })

  it('should render buttons with correct CSS classes for styling', () => {
    const wrapper = mount(DailyLog, {
      props: {
        foods: mockFoods,
      },
    })

    const buttons = wrapper.findAll('.btn-edit, .btn-delete')
    // Verify buttons exist and have the proper styling classes
    buttons.forEach((button) => {
      expect(button.element).toBeDefined()
    })
    expect(buttons.length).toBeGreaterThan(0)
  })
})
