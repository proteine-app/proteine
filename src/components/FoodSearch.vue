<template>
  <div class="food-search">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search for food..."
      class="search-input"
      @input="onSearch"
      aria-label="Food search"
    />

    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      Searching...
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <!-- Results list -->
    <ul v-if="results.length > 0 && !isLoading" class="results-list">
      <li v-for="food in results" :key="food.name" class="result-item">
        <button
          type="button"
          class="result-button"
          @click="selectFood(food)"
        >
          <span class="food-name">{{ food.name }}</span>
          <span class="protein-info">{{ food.proteinPer100g }}g protein/100g</span>
        </button>
      </li>
    </ul>

    <!-- No results message -->
    <div v-if="searchQuery && results.length === 0 && !isLoading && !errorMessage" class="no-results">
      No foods found
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { searchFood } from '../services/api.js'
import * as storage from '../services/storage.js'
import { error as showError } from '../services/notifications'

let debounceTimer

export default {
  name: 'FoodSearch',
  emits: ['food-selected'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const results = ref([])
    const isLoading = ref(false)
    const errorMessage = ref('')

    const onSearch = async () => {
      // Clear any existing timer
      clearTimeout(debounceTimer)

      if (!searchQuery.value.trim()) {
        results.value = []
        errorMessage.value = ''
        return
      }

      // Set debounce timer for 300ms
      debounceTimer = setTimeout(async () => {
        isLoading.value = true
        errorMessage.value = ''
        results.value = []

        try {
          const searchResults = await searchFood(searchQuery.value, storage)
          results.value = searchResults
          if (searchResults.length === 0 && searchQuery.value.trim()) {
            showError('No foods found. Try a different name.')
          }
        } catch (error) {
          console.error('Search error:', error)
          let errorMsg = 'Failed to search foods. Please try again.'
          if (error.name === 'AbortError') {
            errorMsg = 'Search timed out. Please try again.'
          } else if (!navigator.onLine) {
            errorMsg = 'No internet connection. Please check your network.'
          }
          errorMessage.value = errorMsg
          showError(errorMsg)
        } finally {
          isLoading.value = false
        }
      }, 300)
    }

    const selectFood = (food) => {
      emit('food-selected', {
        name: food.name,
        proteinPer100g: food.proteinPer100g,
      })
      // Clear search after selection
      searchQuery.value = ''
      results.value = []
      errorMessage.value = ''
    }

    return {
      searchQuery,
      results,
      isLoading,
      errorMessage,
      onSearch,
      selectFood,
    }
  },
}
</script>

<style scoped>
.food-search {
  width: 100%;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 44px;
  margin-bottom: 1rem;
}

.search-input:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.loading {
  padding: 0.75rem;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.error {
  padding: 0.75rem;
  color: #d32f2f;
  font-size: 14px;
  text-align: center;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.no-results {
  padding: 0.75rem;
  color: #999;
  font-size: 14px;
  text-align: center;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.result-item {
  border-bottom: 1px solid #eee;
}

.result-item:last-child {
  border-bottom: none;
}

.result-button {
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  border: none;
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  font-size: 16px;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
  transition: background-color 0.15s ease-in-out;
}

.result-button:hover {
  background-color: #f5f5f5;
}

.result-button:active {
  background-color: #eeeeee;
}

.result-button:focus {
  outline: 2px solid #007bff;
  outline-offset: -2px;
}

.food-name {
  display: block;
  font-weight: 500;
  color: #333;
}

.protein-info {
  display: block;
  font-size: 14px;
  color: #666;
}

@media (min-width: 600px) {
  .food-search {
    margin-bottom: 2rem;
  }

  .search-input {
    margin-bottom: 1.5rem;
  }
}
</style>
