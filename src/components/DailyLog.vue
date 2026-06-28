<template>
  <div class="daily-log">
    <!-- Empty state -->
    <div v-if="foods.length === 0" class="empty-state">
      <p>No foods added yet. Start tracking your protein intake!</p>
    </div>

    <!-- Foods list -->
    <div v-else class="foods-list">
      <div v-for="food in foods" :key="food.id" class="food-row">
        <!-- Display mode -->
        <div v-if="!isEditing(food.id)" class="food-display">
          <span class="food-name">{{ food.name }}</span>
          <span class="food-grams">{{ food.grams }}g</span>
          <span class="food-protein">{{ calculateFoodProtein(food).toFixed(1) }}g</span>
          <button
            class="btn-edit"
            @click="startEdit(food)"
            title="Edit food grams"
          >
            Edit
          </button>
          <button
            class="btn-delete"
            @click="confirmDelete(food.id)"
            title="Delete food"
          >
            Delete
          </button>
        </div>

        <!-- Edit mode -->
        <div v-else class="food-edit">
          <span class="food-name">{{ food.name }}</span>
          <input
            v-model.number="editGrams"
            type="number"
            min="0"
            step="0.1"
            class="input-grams"
            @keyup.enter="submitEdit(food.id)"
            @keyup.escape="cancelEdit"
          />
          <span class="food-protein">{{ (editGrams * food.proteinPer100g / 100).toFixed(1) }}g</span>
          <button
            class="btn-save"
            @click="submitEdit(food.id)"
            title="Save changes"
          >
            Save
          </button>
          <button
            class="btn-cancel"
            @click="cancelEdit"
            title="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateProtein } from '../services/calculator.js'

export default {
  name: 'DailyLog',
  props: {
    foods: {
      type: Array,
      required: true,
      validator: (foods) => Array.isArray(foods),
    },
  },
  emits: ['food-deleted', 'food-edit-started', 'food-updated'],
  data() {
    return {
      editingId: null,
      editGrams: null,
    }
  },
  methods: {
    calculateFoodProtein(food) {
      return calculateProtein(food.grams, food.proteinPer100g)
    },
    isEditing(foodId) {
      return this.editingId === foodId
    },
    startEdit(food) {
      this.editingId = food.id
      this.editGrams = food.grams
      this.$emit('food-edit-started', food)
    },
    submitEdit(foodId) {
      if (this.editGrams === null || this.editGrams < 0) {
        this.cancelEdit()
        return
      }
      this.$emit('food-updated', {
        id: foodId,
        grams: this.editGrams,
      })
      this.editingId = null
      this.editGrams = null
    },
    cancelEdit() {
      this.editingId = null
      this.editGrams = null
    },
    confirmDelete(foodId) {
      if (confirm('Are you sure you want to delete this food?')) {
        this.$emit('food-deleted', foodId)
      }
    },
  },
}
</script>

<style scoped>
.daily-log {
  width: 100%;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 16px;
}

.foods-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.food-row {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.food-display,
.food-edit {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.food-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  min-width: 100px;
}

.food-grams,
.food-protein {
  min-width: 60px;
  text-align: right;
  font-size: 16px;
}

.input-grams {
  min-width: 60px;
  padding: 0.25rem 0.5rem;
  font-size: 16px;
  border: 1px solid #999;
  border-radius: 3px;
  text-align: right;
}

.btn-edit,
.btn-delete,
.btn-save,
.btn-cancel {
  width: 44px;
  height: 44px;
  padding: 0;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #e8f0fe;
}

.btn-delete:hover {
  background-color: #fce4ec;
}

.btn-save:hover {
  background-color: #c8e6c9;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
}

.btn-edit:active,
.btn-delete:active,
.btn-save:active,
.btn-cancel:active {
  transform: scale(0.98);
}
</style>
