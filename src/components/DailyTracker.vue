<template>
  <div class="daily-tracker">
    <div class="weight-input-section">
      <label for="body-weight-input" class="weight-label">Body Weight (kg)</label>
      <input
        id="body-weight-input"
        v-model.number="bodyWeight"
        type="number"
        class="weight-input"
        placeholder="Enter your body weight in kg"
        @input="handleWeightChange"
      />
    </div>

    <div class="progress-section">
      <div class="daily-stats">
        <div class="stat-item">
          <h3>Daily Target</h3>
          <p data-testid="daily-target" class="stat-value">
            {{ target.toFixed(1) }}g
          </p>
        </div>
        <div class="stat-item">
          <h3>Consumed</h3>
          <p data-testid="consumed-protein" class="stat-value">
            {{ totalProtein.toFixed(1) }}g
          </p>
        </div>
      </div>

      <div
        :class="['progress-bar', `progress-${progressColor}`]"
        :style="{ width: progressPercentage + '%' }"
        data-testid="progress-bar"
        role="progressbar"
        :aria-valuenow="progressPercentage"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>

    <div class="actions-section">
      <button
        data-testid="reset-button"
        class="btn btn-reset"
        @click="handleResetClick"
      >
        Reset Day
      </button>
      <button
        data-testid="delete-weight-button"
        class="btn btn-delete"
        @click="handleDeleteWeight"
      >
        Delete Weight
      </button>
    </div>
  </div>
</template>

<script>
import { calculateTarget, calculateTotalProtein, getProgressColor } from '../services/calculator'

export default {
  name: 'DailyTracker',
  props: {
    foods: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ['weight-changed', 'reset-clicked'],
  data() {
    return {
      bodyWeight: null,
    }
  },
  computed: {
    target() {
      return this.bodyWeight ? calculateTarget(this.bodyWeight) : 0
    },
    totalProtein() {
      return calculateTotalProtein(this.foods)
    },
    progressColor() {
      return getProgressColor(this.totalProtein, this.target)
    },
    progressPercentage() {
      if (this.target === 0) {
        return 0
      }
      const percentage = (this.totalProtein / this.target) * 100
      return Math.min(percentage, 100)
    },
  },
  methods: {
    handleWeightChange() {
      this.$emit('weight-changed', this.bodyWeight)
    },
    handleResetClick() {
      if (confirm('Are you sure you want to reset the day?')) {
        this.$emit('reset-clicked')
      }
    },
    handleDeleteWeight() {
      this.bodyWeight = null
    },
  },
}
</script>

<style scoped>
.daily-tracker {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.weight-input-section {
  margin-bottom: 24px;
}

.weight-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.weight-input {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.weight-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.progress-section {
  margin-bottom: 24px;
}

.daily-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-item h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.progress-bar {
  height: 24px;
  background-color: #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s ease;
  min-width: 2px;
}

.progress-red {
  background-color: #e74c3c;
}

.progress-orange {
  background-color: #f39c12;
}

.progress-yellow {
  background-color: #f1c40f;
}

.progress-green {
  background-color: #27ae60;
}

.actions-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;
}

.btn-reset {
  background-color: #4a90e2;
  color: white;
}

.btn-reset:hover {
  background-color: #357abd;
}

.btn-reset:active {
  transform: scale(0.98);
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.btn-delete:active {
  transform: scale(0.98);
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
  .daily-tracker {
    padding: 16px;
  }

  .daily-stats {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn {
    min-width: auto;
  }
}
</style>
