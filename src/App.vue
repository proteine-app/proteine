<template>
  <div id="app">
    <Toast />

    <header class="app-header">
      <h1>🥗 Protein Tracker</h1>
    </header>

    <main class="app-main">
      <DailyTracker
        :foods="currentFoods"
        @weight-changed="handleWeightChanged"
        @reset-clicked="handleResetDay"
      />

      <FoodSearch
        @food-selected="handleFoodSelected"
      />

      <FoodEntry
        :selected-food="selectedFood"
        @food-added="handleFoodAdded"
      />

      <DailyLog
        :foods="currentFoods"
        @food-deleted="handleFoodDeleted"
        @food-edit-started="handleEditStarted"
        @food-updated="handleFoodUpdated"
      />
    </main>

    <footer class="app-footer">
      <p>Track your daily protein intake • No history, no accounts</p>
    </footer>
  </div>
</template>

<script>
import Toast from './components/Toast.vue'
import DailyTracker from './components/DailyTracker.vue'
import FoodSearch from './components/FoodSearch.vue'
import FoodEntry from './components/FoodEntry.vue'
import DailyLog from './components/DailyLog.vue'

import {
  getDailyData,
  saveDailyData,
  setWeight,
  addFood,
  updateFood,
  removeFood,
  clearDayFoods,
} from './services/storage'

export default {
  name: 'App',
  components: {
    Toast,
    DailyTracker,
    FoodSearch,
    FoodEntry,
    DailyLog,
  },
  data() {
    return {
      currentFoods: [],
      selectedFood: null,
    }
  },
  created() {
    this.loadDailyData()
  },
  methods: {
    loadDailyData() {
      const data = getDailyData()
      this.currentFoods = data.foods || []
    },
    handleWeightChanged(kg) {
      if (kg !== null) {
        setWeight(kg)
      }
    },
    handleFoodSelected(food) {
      this.selectedFood = food
    },
    handleFoodAdded(foodData) {
      const newFood = addFood({
        name: foodData.name,
        grams: foodData.grams,
        proteinPer100g: foodData.proteinPer100g,
      })
      this.currentFoods = getDailyData().foods
      this.selectedFood = null
    },
    handleFoodDeleted(foodId) {
      removeFood(foodId)
      this.currentFoods = getDailyData().foods
    },
    handleEditStarted(food) {
      // Edit mode is managed in DailyLog component
    },
    handleFoodUpdated(update) {
      updateFood(update.id, { grams: update.grams })
      this.currentFoods = getDailyData().foods
    },
    handleResetDay() {
      clearDayFoods()
      this.currentFoods = []
    },
  },
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
}

.app-main {
  flex: 1;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background-color: #333;
  color: #fff;
  padding: 1.5rem;
  text-align: center;
  font-size: 12px;
  border-top: 1px solid #444;
}

.app-footer p {
  margin: 0;
}

@media (min-width: 768px) {
  .app-header h1 {
    font-size: 32px;
  }

  .app-main {
    padding: 2rem 1rem;
  }
}
</style>
