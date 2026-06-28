<template>
  <div class="food-entry">
    <div v-if="selectedFood" class="food-entry-container">
      <h2>{{ selectedFood.name }}</h2>

      <div class="input-group">
        <label for="grams-input">Grams:</label>
        <input
          id="grams-input"
          v-model.number="grams"
          type="number"
          min="0"
          step="0.1"
          placeholder="Enter grams"
        />
      </div>

      <div class="protein-display">
        <p>Protein: <strong>{{ proteinAmount }} g</strong></p>
      </div>

      <button
        @click="addFood"
        :disabled="!isValid"
        class="add-button"
      >
        Add to Day
      </button>

      <div v-if="grams !== null && grams !== undefined && !isValid" class="error">
        Grams must be a positive number
      </div>
    </div>
    <div v-else class="no-food-selected">
      <p>Select a food to get started</p>
    </div>
  </div>
</template>

<script>
import { calculateProtein } from '../services/calculator.js'

export default {
  name: 'FoodEntry',
  props: {
    selectedFood: {
      type: Object,
      default: null,
      validator: (value) => {
        if (!value) return true
        return 'name' in value && 'proteinPer100g' in value
      },
    },
  },
  emits: ['food-added'],
  data() {
    return {
      grams: null,
    }
  },
  computed: {
    proteinAmount() {
      if (!this.selectedFood || !this.grams || this.grams <= 0) {
        return 0
      }
      return Math.round(
        calculateProtein(this.grams, this.selectedFood.proteinPer100g) * 100
      ) / 100
    },
    isValid() {
      return this.grams > 0
    },
  },
  methods: {
    addFood() {
      if (!this.isValid || !this.selectedFood) {
        return
      }

      this.$emit('food-added', {
        name: this.selectedFood.name,
        grams: this.grams,
        proteinPer100g: this.selectedFood.proteinPer100g,
      })

      this.grams = null
    },
  },
  watch: {
    selectedFood() {
      this.grams = null
    },
  },
}
</script>

<style scoped>
.food-entry {
  margin: 2rem 0;
}

.food-entry-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #555;
}

input[type='number'] {
  font-size: 16px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 44px;
}

input[type='number']:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.protein-display {
  padding: 1rem;
  background-color: #f0f8ff;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.protein-display p {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.protein-display strong {
  color: #007bff;
  font-weight: 700;
}

.add-button {
  font-size: 16px;
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  min-height: 44px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-button:hover:not(:disabled) {
  background-color: #218838;
}

.add-button:active:not(:disabled) {
  background-color: #1e7e34;
}

.add-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.error {
  color: #d32f2f;
  font-size: 14px;
  margin: 0;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.no-food-selected {
  padding: 2rem;
  text-align: center;
  color: #999;
  background-color: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.no-food-selected p {
  margin: 0;
  font-size: 16px;
}
</style>
